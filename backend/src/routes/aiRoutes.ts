import { Router, Request, Response } from "express";
import { pool } from "../db";
import { authenticateToken } from "../middleware/auth";
import { generateInsights } from "../services/analysisService";
import { analyzeSpending } from "../services/aiService";

const router = Router();
router.use(authenticateToken);

router.get("/analyze", async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = (req as any).user.id;
        const { month, year } = req.query;

        const monthNum = Number(month);
        const yearNum = Number(year);

        if (!monthNum || !yearNum) {
            return res.status(400).json({ message: "Month and year required" });
        }


        if (!month || !year) {
            return res.status(400).json({ message: "Month and year required" });
        }

        // Current month
        const [current]: any = await pool.query(
            `
      SELECT c.name as category, SUM(e.amount) as total
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      AND e.type = 'expense'
      AND MONTH(e.transaction_date) = ?
      AND YEAR(e.transaction_date) = ?
      GROUP BY c.name
    `,
            [userId, month, year]
        );

        // Previous month
        // const prevMonth = month == 1 ? 12 : Number(month) - 1;
        // const prevYear = (month == 1 )? Number(year) - 1 : year;
        const prevMonth = monthNum === 1 ? 12 : monthNum - 1;
        const prevYear = monthNum === 1 ? yearNum - 1 : yearNum;

        const [previous]: any = await pool.query(
            `
      SELECT c.name as category, SUM(e.amount) as total
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      AND e.type = 'expense'
      AND MONTH(e.transaction_date) = ?
      AND YEAR(e.transaction_date) = ?
      GROUP BY c.name
    `,
            [userId, prevMonth, prevYear]
        );

        const insights = generateInsights(current, previous);

        const aiResponse = await analyzeSpending({
            month,
            insights,
        });

        res.json({
            insights,
            explanation: aiResponse,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "AI analysis failed" });
    }
});

export default router;