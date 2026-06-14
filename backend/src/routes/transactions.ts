import { Router } from 'express';
import * as ctrl from '../controllers/transactionController';

const router = Router();

router.get('/',                        ctrl.getTransactions);
router.post('/',                       ctrl.addTransaction);
router.get('/summary/:year/:month',    ctrl.getSummary);
router.get('/budgets/:year/:month',    ctrl.getBudgets);
router.get('/trend/:months',           ctrl.getTrend);
router.patch('/budgets/:category',     ctrl.updateBudget);
router.delete('/:id',                  ctrl.removeTransaction);
router.patch('/:id',                   ctrl.editTransaction);

export default router;
