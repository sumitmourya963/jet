"use strict";angular.module("radarApp",["ngAnimate","ngRoute","ngSanitize","ngTouch","jet"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("radarApp").directive("floatlabel",[function(){return{restrict:"A",link:function(a,b,c){var d=a.$eval(c.floatlabel),e=a.$eval(c.placeholder);console.log(d,e),$(b).attr("placeholder",e||d),$(b).data("label",d),$(b).floatlabel()}}}]),angular.module("radarApp").directive("valueRule",[function(){return{restrict:"A",require:"ngModel",link:function(a,b,c,d){var e=/(.*?)\s*(==|>|<)\s*([^\s]+)\s*/,f={"==":"equals",">":"greaterThan","<":"lessThan"},g=function(a){var b=d.$modelValue,c=a.match(e);if(""===a)return b.fieldString="",b.value=void 0,d.$setValidity("valueRule",!0),b;if(c)try{b.fieldString=c[1],b.op=f[c[2]],b.op?(b.value=JSON.parse(c[3]),d.$setValidity("valueRule",!0)):d.$setValidity("valueRule",!1)}catch(g){d.$setValidity("valueRule",!1)}else d.$setValidity("valueRule",!1);return b};d.$parsers.unshift(g);var h=function(a){return void 0!==a.value?(d.$setValidity("valueRule",!0),a.fieldString+" == "+JSON.stringify(a.value)):void 0};d.$formatters.push(h)}}}]),angular.module("radarApp").directive("connectionSetup",["$window",function(a){return{restrict:"A",templateUrl:"partials/connection-setup.html",replace:!0,scope:{connect:"&",status:"=",disconnect:"&"},controller:["$scope",function(b){b.state={expanded:!1,url:""};var c=a.localStorage;c["radar.connections"]=c["radar.connections"]||"[]";var d;try{d=JSON.parse(c["radar.connections"])}catch(e){d=[]}b.storedConnections=d,d.length>0&&(b.state.url=d[0]);var f=function(a){var b=/(ws|wss):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;return b.test(a)};b.isValidWsUrl=!1,b.removeStoredConnection=function(a){d.splice(d.indexOf(a),1)},b.$watch("state.url",function(a){b.isValidWsUrl=f(a)}),b.storedConnections=d,b.$watch("storedConnections",function(a){c["radar.connections"]=JSON.stringify(a)},!0),b.$watch("status",function(a){if("connected"===a){var c=b.storedConnections.indexOf(b.state.url);0!==c&&(b.storedConnections.splice(c,1),b.storedConnections.unshift(b.state.url)),b.nextAction="disconnect"}else b.nextAction="disconnected"===a?"connect":!1}),b.submit=function(){b.nextAction&&(console.log(b[b.nextAction]),b[b.nextAction]({url:b.state.url}))}}]}}]),angular.module("radarApp").directive("state",[function(){return{restrict:"A",templateUrl:"partials/state.html",replace:!0,scope:{state:"="},controller:["$scope",function(a){var b={};a.flatTree=b,a.asJSON=!1;var c={object:"text",number:"number",string:"text","boolean":"checkbox"},d=function(a,e){angular.isDefined(e)||(e=""),b[e]={},angular.isArray(a)?a.forEach(function(f,g){var h="["+g+"]";angular.isObject(f)?d(f,e+"."+h):b[e][h]={parent:a,name:h,inputType:c[typeof f]}}):Object.keys(a).forEach(function(f){console.log("key",f,typeof f),angular.isObject(a[f])?d(a[f],e+"."+f):b[e][f]={parent:a,name:f,inputType:c[typeof a[f]]}}),angular.forEach(b,function(a,c){0===Object.keys(a).length&&delete b[c]})};a.$watch("state.$value",function(e){Object.keys(b).forEach(function(a){delete b[a]}),angular.isObject(e)?d(e):b[""]={"":{parent:a.state,name:"$value",inputType:c[typeof e]}},a.valueAsJSON=angular.toJson(e,2)}),a.saveJSON=function(){try{a.state.$value=JSON.parse(a.valueAsJSON),a.state.$save()}catch(b){}}}]}}]),angular.module("radarApp").directive("method",[function(){return{restrict:"A",templateUrl:"partials/method.html",replace:!0,scope:{method:"="},controller:["$scope",function(a){a.argsJSON="[]",a.$watch("argsJSON",function(b){try{a.args=JSON.parse(b)}catch(c){a.args=[]}})}]}}]),angular.module("radarApp").controller("MainCtrl",["$scope","$jet",function(a,b){a.status="disconnected",a.disconnect=function(){a.peer&&a.peer.$close(),delete a.elements,a.status="disconnected"},a.connect=function(c){a.status="connecting",delete a.elements,a.peer&&a.peer.$close(),a.peer=new b.$Peer({url:c,scope:a}),a.peer.$connected.then(function(){a.status="connected"},function(){a.status="disconnected"})},a.reset=function(){a.elements&&a.elements.$unfetch(),delete a.elements},a.showfetchExpressionAsJSON=!1,a.maxFetchEntries=20,a.fetchCaseSensitive=!0,a.fetchExpression={},a.makeFetchExpression=function(){if(!a.fetchForm.$invalid){var b=a.pathFilters,c=a.valueFilters;a.fetchExpression.sort={},a.fetchExpression.sort.from=1,a.fetchExpression.sort.to=20;var d=b.filter(function(a){return""!==a.value});0===d.length?delete a.fetchExpression.path:(a.fetchExpression.path={},a.fetchExpression.path.caseInsensitive=!a.fetchCaseSensitive),d.forEach(function(b){var c;if(b.invalid=!1,b.toJSON)try{c=b.toJSON(b.value)}catch(d){return void(b.invalid=!0)}else c=b.value;a.fetchExpression.path[b.op]=c});var e=c.filter(function(a){return void 0!==a.value});delete a.fetchExpression.value,delete a.fetchExpression.valueField,e.forEach(function(b){if(""!==b.fieldString){a.fetchExpression.valueField=a.fetchExpression.valueField||{};var c={};c[b.op]=b.value,a.fetchExpression.valueField[b.fieldString]=c}else a.fetchExpression.value=a.fetchExpression.value||{},a.fetchExpression.value[b.op]=b.value}),"byValue"===a.fetchSortCriteria&&(""!==a.fetchSortByValueFieldString?(a.fetchExpression.sort.byValueField={},a.fetchExpression.sort.byValueField[a.fetchSortByValueFieldString]=a.fetchSortByValueType):a.fetchExpression.sort.byValue=a.fetchSortByValueType),a.fetchExpression.sort.descending="descending"===a.fetchSortDirection,a.fetchExpressionJSON=angular.toJson(a.fetchExpression,2)}},a.fetch=function(){"connected"===a.status&&(a.reset(),a.makeFetchExpression(),a.elements=a.peer.$fetch(a.fetchExpression),a.elements.$autoSave(!1))},a.inputTypes={string:"text",number:"number"},a.caseSensitive=!1,a.pathFilters=[{op:"contains",value:"",info:"(e.g.: id)"},{op:"startsWith",value:"",info:"(e.g: players)"},{op:"containsOneOf",value:"",info:"(e.g: status LEDS)",toJSON:function(a){return a.split(" ")}},{op:"containsAllOf",value:"",info:"(e.g: status LEDS)",toJSON:function(a){return a.split(" ")}}],a.valueFilters=[{op:"equals",fieldString:""}],a.fetchSortCriteria="byPath",a.fetchSortByValueFieldString="",a.fetchSortByValueType="number",a.fetchSortDirection="descending"}]),angular.module("radarApp").controller("AboutCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]);