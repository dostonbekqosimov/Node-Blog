
const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const router = express();

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWR_SECRET;

const description = "I am Doston Sulaymon, a 22-year-old Software Engineer from Tashkent, Uzbekistan";

/**
 * 
 * Check Login
*/
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}


/**
 * Get /
 * Admin - Login
 */


router.get('/admin', async (req, res) => {

    try {
        const locals = {
            title: "Admin",
            description: "My thoughts"
        }
        // const data = await Post.find();
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});


/**
 * Get /
 * Admin - Check Login
 */

router.post('/admin', async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await User.findOne({ username });



        if (!user) {
            return res.status(401).json({ message: 'Invalid name' });
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid pass' });

        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/dashboard')



        // res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

/**
 * GET /
 * Admin Dashboard
*/
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Dashboard',
            description: description
        }

        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });

    } catch (error) {
        console.log(error);
    }

});


/**
 * GET /
 * 
*/

router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Add Post',
            description: description
        }

        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            data,
            layout: adminLayout
        });

    } catch (error) {
        console.log(error);
    }

});


/**
 * POST /
 * Add new post
*/

router.post('/add-post', authMiddleware, async (req, res) => {
    try {


        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }


    } catch (error) {
        console.log(error);
    }

});

/**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {

        const locals = {
            title: "Edit Post",
            description: "Free NodeJs User Management System",
        };

        const data = await Post.findOne({ _id: req.params.id });

        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
        })

    } catch (error) {
        console.log(error);
    }

});

/**
 * PUT /
 * Admin - Create New Post
*/
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {

        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/dashboard`);

    } catch (error) {
        console.log(error);
    }

});



/**
 * Get /
 * Admin - Register
 */

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User Created', user });
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in use' });
            }
            res.status(500).json({ message: 'Internal server error' })
        }

    } catch (error) {
        console.log(error);
    }
});

/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }

});


/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful.'});
    res.redirect('/');
});

module.exports = router;
