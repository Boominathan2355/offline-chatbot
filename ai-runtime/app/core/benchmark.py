import time
import psutil
import statistics
from typing import Dict, Any, List

class Benchmark:
    def __init__(self, model_path: str = None):
        self.model_path = model_path
        # Standardized prompt set for comparable metrics
        self.prompts = [
            "Explain quantum computing in simple terms.",
            "Write a Python function to calculate Fibonacci numbers.",
            "Summarize the benefits of regular exercise.",
            "What is the capital of France?"
        ]

    def run_benchmark(self) -> Dict[str, Any]:
        """
        Runs an automated benchmark pipeline:
        1. Warmup
        2. Standardized Prompts
        3. Metrics Collection
        """
        metrics = {
            "model": self.model_path if self.model_path else "mock-model",
            "timestamp": time.time(),
            "runs": []
        }

        # 1. Measure System Baseline
        mem_before = psutil.virtual_memory().used
        
        # 2. Warmup
        print("Warming up...")
        time.sleep(0.5) 

        # 3. Run Standardized Prompts
        latencies = []
        tps_list = []
        
        for i, prompt in enumerate(self.prompts):
            start_time = time.perf_counter()
            
            # Mock Inference
            # In real scenario: output = llm.generate(prompt)
            # Simulating variable generation time based on prompt length
            time.sleep(1.0 + (len(prompt) / 50.0)) 
            token_count = 50 + len(prompt) # Mock token count
            
            end_time = time.perf_counter()
            
            duration = end_time - start_time
            tps = token_count / duration
            
            latencies.append(duration * 1000)
            tps_list.append(tps)
            
            metrics["runs"].append({
                "prompt_id": i,
                "latency_ms": round(duration * 1000, 2),
                "tokens_per_sec": round(tps, 2)
            })

        # 4. Measure System After
        mem_after = psutil.virtual_memory().used
        
        # Aggregated Metrics
        avg_latency = statistics.mean(latencies)
        avg_tps = statistics.mean(tps_list)
        ram_diff_mb = (mem_after - mem_before) / (1024 * 1024)

        metrics["aggregated"] = {
            "tokens_per_sec": round(avg_tps, 2),
            "latency_ms": round(avg_latency, 2),
            "ram_usage_mb": round(mem_after / (1024 * 1024), 2),
            "ram_increase_mb": round(ram_diff_mb, 2),
            "cpu_percent": psutil.cpu_percent()
        }

        return metrics
