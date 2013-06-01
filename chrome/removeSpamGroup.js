debugger;
var Temp = {}
function jsonp(url, callback) {
    // http://developer.chrome.com/extensions/xhr.html
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            callback(eval("(" + xhr.responseText + ")"));
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

jsonp('http://spamgroup.tonyq.org/groups/json/', function(data) {
    var group_list = [];
    for(var k=0;k<data.length;k++) {
        group_list.push(data[k]["GID"]);
    }
    console.log(group_list);
    detectSpamGroup(group_list);
});

function detectSpamGroup(group_list) {
    // high light spam group
    var groups = document.getElementsByClassName('pvm');
    for(var i=0;i<groups.length;i++) {
        var group = groups[i];
        if(group.href) {
            var match = group.href.match(/groups\/([\d]+)\//);
            if(match && group_list.indexOf(match[1]) >= 0) {
                group.style.backgroundColor="red";
            }
        }
    }


    var nodes = document.getElementsByClassName('itemAnchor');
    var onleaveInt = null;

    for(var i=0;i<nodes.length; i++) {
        var node = nodes[i];

        var match = node.href.match(/\/ajax\/bookmark\/groups\/leave\/\?group_id=([\d]+)/);
        console.log(match);
        if(match && group_list.indexOf(match[1]) >= 0) {
            // execute quit group script
            click(node);
            onleaveInt = setInterval(function() {
                var buttons = document.getElementsByTagName("button");
                for(var j=0; j<buttons.length; j++) {
                    var button = buttons[j];
                    if(button.name == "confirmed") {
                        console.log("find confirm button");
                        // click(button);
                        clearInterval(onleaveInt);
                    }
                }
            });
            // can only remove one group once
            break;
        }
    }
}

function click(el) {
    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, true);
    el.dispatchEvent(evt);
}



