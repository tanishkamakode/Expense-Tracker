export const generateInsights = (current: any[], previous: any[]) => {
    const insights: any = {
        currentMonthTotals: current,
        previousMonthTotals: previous,
        comparisons: {}
    };

    const prevMap = new Map();
    if (Array.isArray(previous)) {
        for (const item of previous) {
            prevMap.set(item.category, Number(item.total));
        }
    }

    if (Array.isArray(current)) {
        for (const item of current) {
            const category = item.category;
            const currentTotal = Number(item.total);
            const prevTotal = prevMap.get(category) || 0;
            
            const difference = currentTotal - prevTotal;
            const percentChange = prevTotal > 0 ? (difference / prevTotal) * 100 : (currentTotal > 0 ? 100 : 0);

            insights.comparisons[category] = {
                current: currentTotal,
                previous: prevTotal,
                difference,
                percentChange: percentChange.toFixed(2) + '%'
            };
        }
    }

    return insights;
};
