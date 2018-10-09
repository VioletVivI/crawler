//22222222222222222
var http=require('http');
// var url="http://www.imooc.com/learn/348";
var cheerio=require('cheerio');

//每个视频网页的id
var pageId=[728,637,348,259,197,134];
var baseUrl="http://www.imooc.com/learn/";
var numBaseUrl="http://www.imooc.com/course/AjaxCourseMembers?ids=";


//爬一个页面的视频内容
function chooseChapter(page){
	var $=cheerio.load(page.html);
	var chapter=$('.chapter');
	var title=$('.course-infos').find('h2').text();
	var number=page.lnumber;

	// courseData={
	// title:
	// number:
	// allVideos:[
	// 	{
	// 		chapterTitle:chapterTitle,
	// 		videos:[
	// 			videoTitle:videoTitle,
	// 			videoId:videoId
	// 		]
	// 	}
	// 	]
	// }
	
	var courseData={
		title:title,
		number:number,
		allVideos:[]
	};


	//遍历每个章节
	chapter.each(function(index,element){

		//章节标题
		var chapterTitle=$(this).find('h3').text().replace(/\s/g,""); //replace(/\s/g,"")消除前后空格
		

		//每个章节的视频集合
		var videos=$(this).find('a');

		// eachChapter={
		// 	chapterTitle:chapterTitle,
		// 	videos:[
		// 		videoTitle:videoTitle,
		// 		videoId:videoId
		// 	]
		// }

		var eachChapter={
			chapterTitle:chapterTitle,
			videos:[]
		};

		videos.each(function(index,element){
			var videoTitle=$(this).text().replace(/\s/g,""); 
			var videoId=$(this).attr('href').split("video/")[1];
			
			eachChapter.videos.push({
				videoTitle:videoTitle,
				videoId:videoId
			});

		});

		courseData.allVideos.push(eachChapter);

	});

	
	return courseData;

};

//打印数据
function printInfo(obj){
	obj.forEach(function(ele){
		console.log("*****************************************************************");
		console.log("课程名称："+ele.title + "【学习人数：" + ele.number+"】");
		ele.allVideos.forEach(function(element){
			console.log(element.chapterTitle);

			element.videos.forEach(function(item){
				console.log('【'+item.videoId+'】'+item.videoTitle);
			});
		});
	});


};

//异步爬取几个页面的全部内容
function getPageAsync(id){
	return new Promise(function(resolve,reject){
		console.log("正在爬取页面");

		var lnumber=0;

		getNumber(id).then(num=>{
			lnumber=num;
		}).catch(
			function(error){console.log('caught', error)}
		);

		var url=baseUrl+id;
		http.get(url,function(res){
			var html='';

			res.on('data',function(data){
				html+=data;
			});

			res.on('end',function(){
				resolve({html,lnumber});
				// var courseData=chooseChapter(html);
				// printInfo(courseData);
			});

		}).on('error',function(e){
			reject(e);
			console.log('获取页面数据错误');

		});

	}).catch(
			function(error){console.log('caught', error)}
	);//.catch() 这个方法，可以用来处理捕捉 rejection 进行处理,不加会报错UnhandledPromiseRejectionWarning
}


function getNumber(id){
	return new Promise(function(resolve,reject){
		var url=numBaseUrl+id;
		http.get(url,function(res){
			var num='';
			res.on('data',function(data){
				num+=data;
				num=JSON.parse(num).data[0].numbers;
			});

			res.on('end',()=>{
				resolve(num);
			});
		}).on('error',function(e){
			reject(e);
			console.log('获取人数错误');

		});
	}).catch(
			function(error){console.log('caught', error)}
	);
}

var pageObj=[];
//遍历页面id，拼接完整的网址,爬取单个页面返回对象放入数组
pageId.forEach(function(ele){
	pageObj.push(getPageAsync(ele));
});

Promise.all(pageObj).then(function(pages){
	var allChapter=[];//存全部页面的视频内容

	//获得每个页面的视频并返回对象
	pages.forEach(function(page){
		var chapter=chooseChapter(page);
		allChapter.push(chapter);
	});

	//排序
	allChapter.sort((x,y)=>y.number-x.number);

	//打印
	printInfo(allChapter);


}).catch(
			function(error){console.log('caught', error)}
);



