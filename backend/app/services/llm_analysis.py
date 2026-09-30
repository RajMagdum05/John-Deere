import os
import re
import logging
from typing import Dict, Any, Tuple, Optional

logger = logging.getLogger("llm_analysis")

# Domain rule-based recommendations for high-reliability offline & demo environments
DEFAULT_RECOMMENDATIONS = {
    "high_idle_time": {
        "likely_cause": "Operator waits during turnaround and unloading with engine idling",
        "action_recommendation": "Turn off engine during 5+ minute waits",
    },
    "low_fuel_efficiency": {
        "likely_cause": "High wheel slip and low gear selection causing engine overload and excess fuel burn",
        "action_recommendation": "Shift up one gear and throttle down to 1850 RPM during disc harrowing",
    },
    "speed_anomaly": {
        "likely_cause": "Operator driving in 2nd Low range during unladen transport instead of Road gear",
        "action_recommendation": "Use 3rd High gear for unladen road haulage and throttle back to 1900 RPM",
    },
    "gps_boundary": {
        "likely_cause": "Swath overshooting field boundary during turnarounds on steep headlands",
        "action_recommendation": "Engage AutoTrac section control when approaching field perimeter to avoid over-spraying",
    },
}

# Cache for analyzed patterns
_PATTERN_CACHE: Dict[str, Dict[str, str]] = {}


def parse_llm_response(text: str) -> Tuple[Optional[str], Optional[str]]:
    """Parse likely cause and action recommendation from LLM output."""
    likely_cause = None
    action_rec = None

    cause_match = re.search(r"Likely Cause:\s*(.*?)(?=\n\s*Action Recommendation:|$)", text, re.DOTALL | re.IGNORECASE)
    if cause_match:
        likely_cause = cause_match.group(1).strip().strip('"').strip("'")

    action_match = re.search(r"Action Recommendation:\s*(.*?)$", text, re.DOTALL | re.IGNORECASE)
    if action_match:
        action_rec = action_match.group(1).strip().strip('"').strip("'")

    return likely_cause, action_rec


def call_openai(prompt: str) -> Optional[str]:
    """Call OpenAI API if key available."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    try:
        import openai
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": "You are an expert farm equipment analyst for John Deere Operations Center."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=150,
            temperature=0.2,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.warning(f"OpenAI call failed: {e}")
        return None


def call_claude(prompt: str) -> Optional[str]:
    """Call Anthropic Claude API if key available."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307"),
            max_tokens=150,
            system="You are an expert farm equipment analyst for John Deere Operations Center.",
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
    except Exception as e:
        logger.warning(f"Claude call failed: {e}")
        return None


def call_gemini(prompt: str) -> Optional[str]:
    """Call Google Gemini API if key available."""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            f"You are an expert farm equipment analyst for John Deere Operations Center.\n\n{prompt}"
        )
        return response.text
    except Exception as e:
        logger.warning(f"Gemini call failed: {e}")
        return None


def analyze_alert_pattern(
    alert_id: str,
    alert_type: str,
    equipment_name: str,
    occurrence_count: int,
    occurrence_dates: list,
    values: list,
    unit: str,
) -> Dict[str, str]:
    """
    Analyze alert pattern using LLM with multi-provider support and rule-based fallback.
    Caches result for ultra-fast subsequent retrieval.
    """
    cache_key = f"{alert_id}:{alert_type}:{occurrence_count}"
    if cache_key in _PATTERN_CACHE:
        return _PATTERN_CACHE[cache_key]

    dates_str = ", ".join(occurrence_dates) if occurrence_dates else "Past 7 days"
    values_str = ", ".join(str(v) for v in values) if values else "N/A"

    prompt = f"""
Analyze this farm equipment alert pattern:

Alert Type: {alert_type}
Equipment: {equipment_name}
Occurrences: {occurrence_count} times in 7 days
Dates: {dates_str}
Values: {values_str} {unit}

Provide:
1. Likely cause (1 sentence, specific to farming operations)
2. Action recommendation (1 sentence, practical, measurable impact)

Format:
Likely Cause: [your answer]
Action Recommendation: [your answer]
""".strip()

    # Try LLM providers in priority order
    raw_text = call_openai(prompt) or call_gemini(prompt) or call_claude(prompt)

    likely_cause = None
    action_recommendation = None

    if raw_text:
        likely_cause, action_recommendation = parse_llm_response(raw_text)

    # Fallback to rule-based recommendations if LLM wasn't available or parse returned None
    norm_type = alert_type.lower().replace(" ", "_").replace("-", "_")
    matched_rule = None
    for k, rule in DEFAULT_RECOMMENDATIONS.items():
        if k in norm_type or (k == "high_idle_time" and "idle" in norm_type) or (k == "low_fuel_efficiency" and "fuel" in norm_type):
            matched_rule = rule
            break

    if not matched_rule:
        matched_rule = DEFAULT_RECOMMENDATIONS["high_idle_time"]

    final_cause = likely_cause or matched_rule["likely_cause"]
    final_action = action_recommendation or matched_rule["action_recommendation"]

    result = {
        "likely_cause": final_cause,
        "action_recommendation": final_action,
    }
    _PATTERN_CACHE[cache_key] = result
    return result
