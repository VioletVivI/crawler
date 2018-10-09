//1111111111111111

var http=require('http');
var url="http://www.imooc.com/learn/348";
var cheerio=require('cheerio');

function chooseChapter(html){
	var $=cheerio.load(html);
	var chapter=$('.chapter');

	var courseData=[];

	//遍历每个章节
	chapter.each(function(index,element){

		//章节标题
		var chapterTitle=$(this).find('h3').text().replace(/\s/g,"");

		//每个章节的视频集合
		var videos=$(this).find('a');


		var eachChapter={
			chapterTitle:chapterTitle,
			videos:[]
		};
		//遍历每个章节里面的视频
		videos.each(function(index,element){
			var videoTitle=$(this).text().replace(/\s/g,"");
			var videoId=$(this).attr('href').split("video/")[1];
			
			eachChapter.videos.push({
				videoTitle:videoTitle,
				videoId:videoId
			});
		});

		courseData.push(eachChapter);

	});

	
	return courseData;

};

//打印出来
function printInfo(courseData){
	courseData.forEach(function(element){
		console.log('\n'+element.chapterTitle);

		element.videos.forEach(function(item){
			console.log('【'+item.videoId+'】'+item.videoTitle);
		});
	});
};


http.get(url,function(res){
	var html='';

	res.on('data',function(data){
		html+=data;
	});

	res.on('end',function(){
		var courseData=chooseChapter(html);
		printInfo(courseData);
	});

}).on('error',function(){
	console.log('错误');
});