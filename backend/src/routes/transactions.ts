import { Router } from 'express';
import * as ctrl from '../controllers/transactionController';

const router = Router();

router.get('/',                        ctrl.getTransactions);
router.post('/',                       ctrl.addTransaction);
router.delete('/:id',                  ctrl.removeTransaction);
router.get('/summary/:year/:month',    ctrl.getSummary);
router.get('/budgets/:year/:month',    ctrl.getBudgets);
router.patch('/budgets/:category',     ctrl.updateBudget);

export default router;
