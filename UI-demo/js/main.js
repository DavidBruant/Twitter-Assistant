$(function() {
	for(i=0 ; i<150 ; i++){
		$(".TA-activity").append(
			$("<div/>")
				.addClass("TA-bar")
				.attr("data-value",Math.round(Math.random() * 100))
				.append($("<div/>")
					.addClass("TA-tweets")
					.css("height",Math.random() * 20 + 10 + "%")
				)
				.append($("<div/>")
					.addClass("TA-links")
					.css("height",Math.random() * 20 + "%")
				)
				.append($("<div/>")
					.addClass("TA-medias")
					.css("height",Math.random() * 10 + "%")
				)
				.append($("<div/>")
					.addClass("TA-replies")
					.css("height",Math.random() * 20 + "%")
				)
				.append($("<div/>")
					.addClass("TA-retweets")
					.css("height",Math.random() * 20 + "%")
				)
		);
	}
	$("#toggle").click(function(event){
		$(".TA-composition-details").toggleClass("TA-active");
	});
});
