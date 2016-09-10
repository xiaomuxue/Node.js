/**
 * Created by YC on 2016/9/6.
 */

function divEscapedContentElement(message){
    return $( '<div></div>').text(message);
}
//显示系统创建的受信内容
function divSystemContentElement(message){
    return $('<div></div>').html('<i>'+message+'</i>');
}

function processUserInput(chatApp,socket){
    var message=$('#send-message').val();
    var systemMessage;
    if(message.charAt(0)=='/'){
        systemMessage=chatApp.processCommand(message);
        if(systemMessage){
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    }else{
        chatApp.sendMessage($('#room').text(),message);   //将非命令输入广播给其他用户
        $('#messages').append(divEscapedContentElement(message));
        $('#message').scrollTop($('#message').prop('scrollHeight'));
    }
    $('#send-message').val('');
}

var socket=io.connect();
$(document).ready(function(){
    var chatApp=new Chat(scoket);
    socket.on('nameResult',function(result){   //显示更名尝试的结果
        var message;
        if(result.success){
            message='You are now know as '+result.name+'.';
        }else{
            message=result.message;
        }
        $('#message').append(divSystemContentElement(message));
    });

    socket.on('joinResult',function(result){    //显示房间变更结果
        $('#room').text(result.room);
        $('#message').append(divSystemContentElement('Room changed.'));
    });

    socket.on('message',function(message){   //显示接收到的消息
        var newElement=$('<div></div>').text(message.text);
        $('#message').append(newElement);
    });

    socket.on('rooms',function(rooms){  //显示可用房间列表
        $('#room-list').empty();
        for(var room in rooms){
            room=room.substring(1,room.length);
            if(room!=''){
                $('#room-list').append(divEscapedContentElement(room));
            }
        }

        $('#room-list div').click(function(){    //点击房间名可以换到那个房间中
            chatApp.processCommand('/join'+$(this).text());
            $('#send-message').focus();
        });
    });

    setInterval(function(){    //定期请求可用房间列表
        socket.emit('rooms');
    },1000);

    $('#send-message').focus();

    $('#send-form').submit(function(){    //提交表单可以发送聊天信息
        processUserInput(chatApp,socket);
        return false;
    });
});