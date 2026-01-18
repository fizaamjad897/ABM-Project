import os
import json
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from typing import Dict, Any

# Load .env file
load_dotenv()

class AIAnalyst:
    def __init__(self):
        # Gemini API Key integration
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.llm = None
        
        if self.api_key:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-2.5-flash",  # Gemini 2.5 Flash (GA)
                    google_api_key=self.api_key,
                    temperature=0.3
                )
                print(f"[AI Analyst] Gemini 2.5 Flash initialized successfully")
            except Exception as e:
                print(f"[AI Analyst] Failed to initialize Gemini: {e}")
                self.llm = None
        else:
            print("[AI Analyst] GOOGLE_API_KEY not found in environment - using fallback mode")

    async def analyze_simulation(self, metrics: Dict[str, Any], query: str) -> str:
        """
        Analyze simulation metrics based on a user query. 
        Falls back to rule-based analysis if OpenAI API fails or quota is exceeded.
        """
        print(f"[AI Analyst] Analyzing query: {query}")
        print(f"[AI Analyst] Metrics keys: {list(metrics.keys())}")
        
        try:
            if not self.llm:
                raise Exception("No LLM initialized - GOOGLE_API_KEY not set in environment")

            # Format metrics for better readability
            metrics_str = json.dumps(metrics, indent=2)
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert in Multi-Agent Systems and distributed caching. Analyze the following simulation metrics and provide insights.\n\nMetrics:\n{metrics}"),
                ("user", "{query}")
            ])
            
            chain = prompt | self.llm
            response = await chain.ainvoke({"metrics": metrics_str, "query": query})
            print(f"[AI Analyst] LLM response received")
            return response.content
            
        except Exception as e:
            print(f"[AI Analyst] LLM failed, using fallback: {str(e)}")
            # FALLBACK TO FREE HEURISTIC ANALYSIS
            hits = metrics.get("hits", 0) or metrics.get("CACHE_HIT", 0)
            misses = metrics.get("misses", 0) or metrics.get("CACHE_MISS", 0)
            total = hits + misses
            ratio = (hits / total * 100) if total > 0 else 0
            
            # Get agent stats if available
            agent_stats = metrics.get("agent_stats", {})
            total_reads = metrics.get("total_reads", total)
            
            analysis = f"**Cache Performance Analysis**\n\n"
            analysis += f"Hit Ratio: {ratio:.1f}% ({hits} hits, {misses} misses)\n"
            analysis += f"Total Reads: {total_reads}\n\n"
            
            if agent_stats:
                analysis += "**Node Performance:**\n"
                for node_id, stats in agent_stats.items():
                    node_hits = stats.get("hits", 0)
                    node_misses = stats.get("misses", 0)
                    node_total = node_hits + node_misses
                    node_ratio = (node_hits / node_total * 100) if node_total > 0 else 0
                    analysis += f"- {node_id}: {node_ratio:.1f}% hit rate ({node_hits}/{node_total})\n"
                analysis += "\n"
            
            if ratio < 50:
                analysis += "⚠️ **Warning:** Heavy pressure on Database detected. Recommendation: Expand cache capacity or investigate Byzantine node failures."
            elif ratio < 70:
                analysis += "⚡ **Moderate Performance:** Cache is working but could be optimized. Consider increasing cache size or adjusting TTL."
            else:
                analysis += "✅ **Optimal Performance:** Network stability is optimal. Cache layers are effectively absorbing traffic."
                
            return f"{analysis}\n\n_(Note: Using rule-based analysis - AI Analyst offline. Set GOOGLE_API_KEY environment variable to enable AI analysis.)_"
