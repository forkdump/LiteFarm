/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userRoute.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const checkScope = require('../middleware/acl/checkScope');
const isSelf = require('../middleware/acl/isSelf');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');

router.get('/:user_id', isSelf, userController.getUserByID());

router.post('/', userController.addUser());

router.post('/pseudo', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:users']), userController.addPseudoUser());

router.put('/:user_id', isSelf, userController.updateUser());

module.exports = router;
