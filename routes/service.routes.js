const express = require('express');
const router = express.Router();
const svc = require('../controllers/service.controller');

router.get('/', svc.listServices);
router.get('/categories', svc.listCategories);
router.post('/', svc.createService);
router.get('/:id', svc.getService);
router.delete('/:id', svc.deleteService);

module.exports = router;
