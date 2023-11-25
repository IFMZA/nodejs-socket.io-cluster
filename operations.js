const post = require('./DTOs/post');

module.exports = {
    mapJsonToPost: function (post_json) {
        let _post = JSON.parse(post_json);
        return _post;
    }
}