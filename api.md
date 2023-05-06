# 接口文档

## 接口说明

- 基于 RESTful API 接口规范
- 基于 JWT 身份认证
- 使用 CORS 跨域
- 接口基础请求地址：`http://127.0.0.1:3000/api/v1`
- 使用 JSON 格式进行数据通信

## 用户注册

path： `/user/registers`  
method： `post`  
是否认证： 否

| 字段名   | 字段类型 | 是否必须 |
| -------- | -------- | -------- |
| username | string   | 是       |
| email    | string   | 是       |
| phone    | string   | 是       |
| password | string   | 是       |

请求示例：

```JSON
{
    "username": "yuzusoft",
    "email": "0721@yuzu.com",
    "phone": 13581887557,
    "password": "114514"
}
```

响应示例：

```JSON
//success
{
    "user": {
        "username": "yuzusoft",
        "email": "0721@yuzu.com",
        "phone": "13581887557",
        "image": null,
        "createAt": "2023-05-06T11:24:54.426Z",
        "updateAt": "2023-05-06T11:24:54.426Z",
        "_id": "64563997047849ad4c847868",
        "__v": 0
    }
}
```

```JSON
//error
{
    "error": [
        {
            "type": "field",
            "value": "0721@yuzu.com",
            "msg": "邮箱已被注册",
            "path": "email",
            "location": "body"
        },
        {
            "type": "field",
            "value": 13581887557,
            "msg": "手机号已被注册",
            "path": "phone",
            "location": "body"
        }
    ]
}
```
