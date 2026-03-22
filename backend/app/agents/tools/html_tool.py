from crewai.tools import tool
import markdown

@tool("Markdown_to_HTML_Converter")
def convert_markdown_to_html(markdown_content: str) -> str:
    """
    Converts raw markdown text into properly formatted semantic HTML.
    Input MUST be a valid markdown string. Use this tool as the final step 
    to format the output for web presentation.
    """
    # We include extensions for tables and extra formatting support
    html_output = markdown.markdown(
        markdown_content, 
        extensions=['extra', 'tables', 'nl2br']
    )
    
    # We wrap it in an article tag for semantic HTML structure
    return f"<article class='markdown-body'>{html_output}</article>"