debugger;

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

function moniterLinkObserver(callback) {
    return new WebKitMutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.type == "childList") {
                for(var i=0;i<mutation.addedNodes.length;i ++) {
                    var links = mutation.addedNodes[i].getElementsByTagName("a");
                    for(var j=0;j<links.length;j++) {
                        callback(links[j]);
                    }
                }
            }
        });
    });
}

jsonp('http://spamgroup.tonyq.org/groups/json/', function(data) {
    var group_list = [];
    for(var k=0;k<data.length;k++) {
        group_list.push(data[k]["GID"]);
    }
    // console.log(group_list);
    // group_list.push("174779442594506");

    var callback = function(link_node) {
        if(!link_node.href) return;

        var match = link_node.href.match(/groups\/([\d]+)\//);
        if(match && group_list.indexOf(match[1]) >= 0) {
            link_node.style.backgroundColor="#f7c6c7";
        }
    }

    var observer = moniterLinkObserver(callback);
    observer.observe(document, {childList:true, subtree:true});

    var links = document.getElementsByTagName("a");
    for(var i=0;i<links.length;i++)
        callback(links[i]);

    detectSpamGroup(group_list);
});

jsonp("http://spamgroup.tonyq.org/users/json/", function(data) {
    var user_list = [];
    for(var k=0;k<data.length; k++) {
        user_list.push(data[k]["GID"]);
    }
    // https://www.facebook.com/profile.php?id=100004677314056&hc_location=friend_browser&fref=pymk
    // user_list.push("100004677314056");
    // http://updates.html5rocks.com/2012/02/Detect-DOM-changes-with-Mutation-Observers
    // mutation observers
    var callback = function(link_node) {
        if(!link_node.href) return;

        var match = link_node.href.match(/profile\.php\?id=([\d]+)/);
        if(match && user_list.indexOf(match[1]) >= 0)
            link_node.style.backgroundColor = "#f7c6c7";
    };

    var observer = moniterLinkObserver(callback);
    observer.observe(document.getElementById('jewelContainer'), { childList: true, subtree:true });

    var links = document.getElementsByTagName("a");
    for(var i=0;i<links.length;i++)
        callback(links[i]);
});


function detectSpamGroup(group_list) {
    var nodes = document.getElementsByClassName('itemAnchor');
    var onleaveInt = null;

    for(var i=0;i<nodes.length; i++) {
        var node = nodes[i];

        var match = node.href.match(/\/ajax\/bookmark\/groups\/leave\/\?group_id=([\d]+)/);
        // console.log(match);
        if(match && group_list.indexOf(match[1]) >= 0) {
            // execute quit group script
            click(node);
            onleaveInt = setInterval(function() {
                var buttons = document.getElementsByTagName("button");
                for(var j=0; j<buttons.length; j++) {
                    var button = buttons[j];
                    if(button.name == "confirmed") {
                        // console.log("find confirm button");
                        click(button);
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



