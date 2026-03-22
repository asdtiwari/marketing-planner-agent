import os
from crewai import Agent, Task, Crew, Process, LLM
from app.agents.tools.chroma_tool import create_secure_search_tool
from app.agents.tools.html_tool import convert_markdown_to_html

def run_marketing_planner(goal: str, org_id: int):
    # Initialize the Secure Search Tool
    secure_search_tool = create_secure_search_tool(org_id=org_id)

    # --- LLM DEFINITIONS ---
    groq_llm = LLM(
        model="groq/llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.3
    )

    openrouter_llm = LLM(
        model="openrouter/meta-llama/llama-3-8b-instruct",
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
        temperature=0.7
    )

    # --- AGENTS ---
    strategist = Agent(
        role='Senior Marketing Strategist',
        goal='Analyze competitor data and formulate a high-level marketing strategy.',
        backstory='An expert in market analysis who uses data to find competitive advantages.',
        verbose=True,
        allow_delegation=False,
        tools=[secure_search_tool],
        llm=groq_llm 
    )

    scheduler = Agent(
        role='Execution Planner',
        goal='Translate the high-level strategy into a detailed, actionable execution schedule.',
        backstory='A highly organized project manager who turns ideas into step-by-step plans.',
        verbose=True,
        allow_delegation=False,
        llm=openrouter_llm 
    )

    # NEW: The Formatting Agent
    publisher = Agent(
        role='Content Publisher',
        goal='Transform the execution schedule into web-ready semantic HTML.',
        backstory='A meticulous web publisher who ensures all content is beautifully formatted for web browsers.',
        verbose=True,
        allow_delegation=False,
        tools=[convert_markdown_to_html],
        llm=groq_llm # We use OpenRouter here as well since it's great at following structural instructions
    )

    # --- TASKS ---
    analysis_task = Task(
        description=f"Goal: {goal}. Search the knowledge base for relevant organizational or competitor data. Formulate a 3-point strategic approach.",
        expected_output="A structured 3-point marketing strategy based on retrieved data.",
        agent=strategist
    )

    scheduling_task = Task(
        description="Take the strategy from the Strategist and create a day-by-day or week-by-week execution schedule. Write this entirely in standard Markdown format.",
        expected_output="A detailed execution schedule written strictly in Markdown.",
        agent=scheduler
    )

    # NEW: The Formatting Task
    formatting_task = Task(
        description="Take the Markdown schedule from the Execution Planner and pass it directly into the Markdown_to_HTML_Converter tool. Your final answer MUST be the exact, unmodified HTML string returned by the tool. Do not add conversational text like 'Here is the HTML'.",
        expected_output="The exact HTML string returned by the converter tool, starting with <article> and ending with </article>.",
        agent=publisher
    )

    # --- CREW ASSEMBLY ---
    crew = Crew(
        agents=[strategist, scheduler, publisher], # Added publisher
        tasks=[analysis_task, scheduling_task, formatting_task], # Added formatting task
        process=Process.sequential
    )

    result = crew.kickoff()
    return str(result)