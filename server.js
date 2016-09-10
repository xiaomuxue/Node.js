/**
 * Created by YC on 2016/9/6.
 */
var http=require("http");    //内置的http模块提供了HTTP服务器和客户端功能
var fs=require("fs");
var path=require("path");  //内置的Path模块提供了与文件系统路径相关的功能
var mime=require("mime");   //附加的mime模块有根据文件扩展名得出MIME类型的能力
var cache={};    //cache是用来缓存文件内容的对象
//当请求文件不存在时，发送404错误
function send404(res){
    res.writeHead(404,{'Content-Type':'Text/plain'});
    res.write('err 404 : resource not found');
    res.end();
}
//提供文件数据服务
function sendFile(res,filePath,fileContents){
    res.writeHead(200,{"content-type":mime.lookup(path.basename(filePath))});  //先写出正确的HTTP头
    res.end(fileContents);   //然后发送文件的内容
}
//确认文件是否缓存了
function serverStatic(res,cache,absPath){
    if(cache[absPath]){   //检查文件是否缓存在内存中
        sendFile(res,absPath,cache[absPath]);  //从内存中返回文件
    }else{
        fs.exists(absPath,function(exists){  //检查文件是否存在
            if(exists){   //存在
                fs.readFile(absPath,function(err,data){  //从硬盘中读取文件
                    if(err) {
                        send404(res);
                    }else{
                        cache[absPath]=data;
                        sendFile(response,absPath,data);  //从硬盘中读取文件并返回
                    }
                });
            }else{    //要是文件不存在，就发送HTTP404响应
                send404(res);    //发送HTTP404响应
            }
        });
    }
}
//创建HTTP服务器的逻辑
var server=http.createServer(function(req,res){   //创建HTTP服务器，用匿名函数定义对每个请求的处理行为
    var filePath=false;
    if(req.url=='/'){
        filePath='public/index.html';   //确定返回的默认HTML文件
    }else{
        filePath='public'+req.url;   //将URL路径转为文件的相对路径
    }
    var absPath='./'+filePath;
    serverStatic(res,cache,absPath);   //返回静态文件
});
//启动HTTP服务器，要是没有文件，则返回下面的信息
server.listen(3000,function(){
    console.info("Server listening on port 3000.");
});

var chatServer=require('./lib/chat_server');    //加载一个定制的Node模块
chatServer.listen(server);   //启动Socket.IO服务器


