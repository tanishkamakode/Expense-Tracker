import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ai-analysis',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ai-analysis.component.html',
  styleUrls: ['./ai-analysis.component.css']
})
export class AiAnalysisComponent implements OnInit {
  private http = inject(HttpClient);

  loading = true;
  error = '';

  comparisons: any[] = [];
  cleanExplanation = '';
  suggestions: string[] = [];

  ngOnInit() {
    this.fetchAnalysis();
  }

  fetchAnalysis() {
    this.loading = true;
    this.error = '';

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    this.http.get(`http://localhost:3000/api/ai/analyze?month=${month}&year=${year}`)
      .subscribe({
        next: (res: any) => {
          this.processApiData(res);
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load AI analysis. Please try again.';
          this.loading = false;
        }
      });
  }

  private processApiData(data: any) {
    if (data.insights?.comparisons) {
      this.comparisons = Object.keys(data.insights.comparisons).map(key => {
        const item = data.insights.comparisons[key];
        const percent = parseFloat(item.percentChange);
        return {
          category: key,
          amount: item.current,
          percentChange: item.percentChange,
          isUnusual: percent > 20 // Highlight if increase > 20%
        };
      });
    }

    if (data.explanation) {
      let text = data.explanation;

      // Remove markdown tables if present
      text = text.replace(/\|.*\|/g, '').replace(/---[-|\s]*---/g, '');

      // Simple extraction of bullet points for suggestions (- or * or 1.)
      const listRegex = /(?:^|\n)(?:[-*]|\d+\.)\s+(.+)/dgm;
      let match;
      this.suggestions = [];

      while ((match = listRegex.exec(text)) !== null) {
        let suggestionHtml = match[1].trim()
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        this.suggestions.push(suggestionHtml);
      }

      // Clean the main explanation from the bullet points
      let cleanText = text.replace(/(?:^|\n)(?:[-*]|\d+\.)\s+(.*)/gm, '').trim();

      // Convert basic markdown to HTML for remaining text
      cleanText = cleanText
        .replace(/### (.*)/g, '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>')
        .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-2 mb-1">$1</h2>')
        .replace(/# (.*)/g, '<h1 class="text-2xl font-bold mt-2 mb-1">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Cap excessive newlines and use <br>
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\n/g, '<br>');

      this.cleanExplanation = cleanText;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  }
}
