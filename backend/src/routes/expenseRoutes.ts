import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// Get all expenses
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const [rows]: any = await pool.query(`
      SELECT e.id, e.amount, e.type, e.transaction_date, e.notes, e.created_at, c.name as category
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.transaction_date DESC, e.created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
});

// Create an expense
router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { amount, type, category, transaction_date, notes } = req.body;
    console.log("Create Expense request body:", req.body);

    if (!amount || !type || !category || !transaction_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find or create category
    let categoryId;
    const [catRows]: any = await pool.query(
      'SELECT id FROM categories WHERE user_id = ? AND name = ?',
      [userId, category]
    );

    if (catRows.length > 0) {
      categoryId = catRows[0].id;
    } else {
      const [insertCatResult]: any = await pool.query(
        'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
        [userId, category, type === 'both' ? 'both' : type]
      );
      categoryId = insertCatResult.insertId;
    }

    const [insertExpResult]: any = await pool.query(
      'INSERT INTO expenses (user_id, category_id, amount, type, transaction_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, categoryId, amount, type, transaction_date, notes || null]
    );

    res.status(201).json({ 
      id: insertExpResult.insertId, 
      amount, 
      type, 
      category, 
      transaction_date, 
      notes,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error creating expense:", err);
    if (err && (err as any).sqlMessage) {
      console.error("SQL Error Message:", (err as any).sqlMessage);
    }
    res.status(500).json({ message: 'Server error saving expense', error: String(err) });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const expenseId = req.params.id;

    await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [expenseId, userId]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
});

export default router;
