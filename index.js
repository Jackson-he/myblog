const express = require('express')
const path = require('path')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')
const winston = require('winston')
const expressWinston = require('express-winston')

const app = express()
// 设置模板目录
app.set('views', path.join(__dirname, 'views'))
// 设置模板引擎为 ejs
app.set('view engine', 'ejs')
// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')))
// session中间件
app.use(session({
    name: config.session.key,
    secret: config.session.secret,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: config.session.maxAge
    },
    store: new MongoStore({
        url: config.mongodb
    })
}))

app.use(flash())

app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'),
    keepExtensions: true
}))

app.locals.blog = {
    title: pkg.name,
    description: pkg.description
}

app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});

// 正常请求的日志
app.use(expressWinston.logger({
    transports: [
        // new (winston.transports.Console)({
        //     json: true,
        //     colorize: true
        // }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}))

// 路由
routes(app)

// 错误请求的日志
app.use(expressWinston.errorLogger({
    transports: [
        // new winston.transports.Console({
        //     json: true,
        //     colorize: true
        // }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}))




app.listen(config.port, function () {
    console.log(`${pkg.name} listning on port ${config.port}`)
})
