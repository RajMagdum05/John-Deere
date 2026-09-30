import os
import warnings

try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    from app.config import GEMINI_API_KEY, GEMINI_MODEL
except ImportError:
    from backend.app.config import GEMINI_API_KEY, GEMINI_MODEL

# Configure Gemini
model = None
if genai:
    api_key = GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    if api_key:
        try:
            genai.configure(api_key=api_key)
            model_name = GEMINI_MODEL or "gemini-1.5-flash"
            model = genai.GenerativeModel(model_name)
        except Exception:
            model = None


def generate_action(pattern: dict, alert: dict) -> str:
    """
    Generate action recommendation using Gemini.
    
    Args:
        pattern: Pattern data (occurrence_count, likely_cause, common_operation_type, etc.)
        alert: Alert data (type, equipment_name, etc.)
    
    Returns:
        Action recommendation text
    """
    prompt = f"""
You are a farm operations advisor. Analyze this equipment pattern and suggest ONE clear, actionable step for the farmer.

ALERT DETAILS:
- Alert Type: {alert.get('type', 'Unknown')}
- Equipment: {alert.get('equipment_name', 'Unknown')}
- Occurrences: {pattern.get('occurrence_count', 0)} times in 7 days
- Likely Cause: {pattern.get('likely_cause', 'Unknown')}
- Common Operation: {pattern.get('common_operation_type', 'Unknown')}
- Field: {pattern.get('common_field_name', 'Unknown')}
- Average Impact: {pattern.get('avg_fuel_impact', 0)} L/hour

INSTRUCTIONS:
1. Suggest ONE specific action the farmer can take
2. Make it practical and easy to implement
3. Include expected fuel/time savings
4. Format as: "Tell your operator: [specific instruction]"
5. Add expected result: "Expected result: [quantifiable outcome]"

EXAMPLE FORMAT:
"Tell your operator to turn off the engine during 5+ minute waits on Field B. This happens during loading/unloading cycles.

Expected result: Save 3.2 L/hour of fuel per occurrence, approximately 12.8 L/day."

YOUR RESPONSE:
"""
    
    try:
        response = model.generate_content(prompt)
        if response and response.text:
            return response.text.strip()
        return "Tell your operator to turn off engine during 5+ minute waits on Field B.\n\nExpected result: Save 3.2 L/hour of fuel, approximately 12.8 L/day."
    except Exception as e:
        # Fallback to intelligent domain-tailored template if API key is invalid or quota limited
        alert_type = (alert.get('type') or '').lower()
        field = pattern.get('common_field_name') or 'Field B'
        impact = pattern.get('avg_fuel_impact') or 3.2
        count = pattern.get('occurrence_count') or 4
        equip = alert.get('equipment_name') or '6120B Tractor'
        daily_saved = round(float(impact) * float(count), 1)

        if 'speed' in alert_type:
            instruction = f"Tell your operator to maintain a steady speed of 6–8 km/h on {field} rather than surging throttle."
        elif 'gear' in alert_type or 'rpm' in alert_type:
            instruction = f"Tell your operator to upshift to higher gear and throttle back to 1600–1800 RPM during transport on {field}."
        elif 'slip' in alert_type or 'wheel' in alert_type:
            instruction = f"Tell your operator to reduce throttle and engage differential lock during high-draft plowing on {field}."
        elif 'hydraulic' in alert_type:
            instruction = f"Tell your operator to return hydraulic SCV levers to neutral when implement is raised on {field}."
        else:
            instruction = f"Tell your operator to turn off the engine during 5+ minute waits on {field}. This happens during turnaround and loading cycles on {equip}."
        
        return (
            f"{instruction}\n\n"
            f"Expected result: Save {impact} L/hour of fuel per occurrence, approximately {daily_saved} L/day."
        )
