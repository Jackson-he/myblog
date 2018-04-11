const config = require('config-lite')(__dirname)
const Mongolass = require('mongolass')
const mongolass = new Mongolass()
const moment = require('moment')
const objectIdToTimeStamp = require('objectid-to-timestamp')

// 根据id 生成创建时间  created_at
mongolass.plugin('addCreatedAt', {
    afterFind: function (results) {
        results.forEach(function (item) {
            item.created_at = moment(objectIdToTimeStamp(item._id)).format('YYYY-MM-DD HH:mm')
        })
        return results
    },
    afterFindOne: function (result) {
        if (result) {
            result.created_at = moment(objectIdToTimeStamp(result._id)).format('YYYY-MM-DD HH:mm')
        }
        return result
    }
})

mongolass.connect(config.mongodb)

exports.User = mongolass.model('User', {
    name: {  type: 'string', required: true },
    password: { type: 'string', required: true },
    avatar: { type: 'string', required: true },
    gender: { type: 'string', enum: ['m', 'f', 'x'], default: 'x' },
    bio: { type: 'string', required: true }
})

exports.Post = mongolass.model('Post', {
    author: { type: Mongolass.Types.ObjectId, required: true },
    title: { type: 'string', required: true },
    content: { type: 'string', required: true },
    pv: { type: 'number', default: 0 }
})

exports.Comment = mongolass.model('Comment', {
    author: { type: Mongolass.Types.ObjectId, required: true },
    content: { type: 'string', required: true },
    postId: { type: Mongolass.Types.ObjectId, required: true }
})

exports.Comment.index({ postId: 1, _id: 1 }).exec()     // 通过文章id 获取该文章下所有留言，按留言创建时间升序
exports.Post.index({ author: 1, _id: -1 }).exec()   // 按创建时间降序查看用户的文章列表
exports.User.index({ name: 1 }, { unique: true }).exec()
