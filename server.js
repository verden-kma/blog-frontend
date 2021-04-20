const {expressCspHeader, INLINE, NONE, SELF} = require('express-csp-header');
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.static('build'))
app.use(expressCspHeader({
    directives: {
        'default-src': [SELF, 'https://sprout-blog.herokuapp.com'],
        'script-src': [SELF, INLINE, 'https://sprout-frontend.herokuapp.com'],
        'style-src': [SELF, 'https://sprout-frontend.herokuapp.com'],
        'img-src': ['data:', '*'],
        'worker-src': [NONE, 'https://sprout-blog.herokuapp.com'],
        'block-all-mixed-content': false
    }
}));
app.listen(port, () => console.log(`listened on port ${port}`))