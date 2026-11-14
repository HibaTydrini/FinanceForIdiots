"""
The connection point between the Table of Contents and the AI agent.

When a learner types a question on a lesson page ("Can you explain this like I'm 12?"),
the page calls POST /api/explain, which calls `explain()` below.

TO THE AI-AGENT TEAMMATE: replace the body of `explain()` with a call to the agent.
Keep the signature; return a plain string (simple **bold** and line breaks are rendered).
`build_prompt()` is provided so the agent gets the lesson content and user profile as context.
"""


def build_prompt(lesson, question, profile):
    return (
        "You are a friendly investing tutor for complete beginners in Canada. "
        "Use simple words, short paragraphs and concrete dollar examples. "
        "Do not give personalized buy/sell recommendations.\n\n"
        f"Learner profile: experience={profile['experience']}, goals={profile['goals']}, "
        f"horizon={profile['horizon_years']} years, risk tolerance={profile['risk_tolerance']}.\n\n"
        f"Lesson: {lesson['title']}\n"
        + "\n".join(lesson["body"])
        + f"\nExample: {lesson['example']}\n\n"
        f"Learner's question: {question}"
    )


def explain(lesson, question, profile):
    """Placeholder until the AI agent is connected. Answers from the lesson's own content."""
    # prompt = build_prompt(lesson, question, profile)
    # return call_the_agent(prompt)
    points = "\n".join(f"• {p}" for p in lesson["key_points"])
    return (
        "The AI tutor isn't connected yet, so here's a quick recap of this lesson.\n\n"
        f"**In short:** {lesson['summary']}\n\n"
        f"**Example:** {lesson['example']}\n\n"
        f"**Remember:**\n{points}"
    )
