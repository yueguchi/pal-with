$(function() {
    $(".loading").hide();
    var pal = {
        const: {
            nadenadeTime: 100, //0.1秒
            smileTime: 1000, // 1秒
            haraheriTime: 600000, // 10分
            natsukiTime: 600000, // 10分
            palImageChangeTime: 1000, // 1秒
        },
    };
    // コミュニケーション機能
    $(".communication.chat").hide();
    $(".communication.meal").hide();
    $(".communication.changeCloth").hide();
    $(".footer-menu").each(function(index, element) {
        $(element).on("click", function(event) {
            if ($(this).attr("data-action") === "chat") {
                $(".communication.chat").show();
                $(".communication.meal").hide();
                $(".communication.changeCloth").hide();
                // is-activeの操作
                $("[data-action='chat']").addClass("is-active");
                $("[data-action='meal']").removeClass("is-active");
                $("[data-action='changeCloth']").removeClass("is-active");
            } else if ($(this).attr("data-action") === "meal") {
                $(".communication.meal").show();
                $(".communication.chat").hide();
                $(".communication.changeCloth").hide();
                // is-activeの操作
                $("[data-action='meal']").addClass("is-active");
                $("[data-action='chat']").removeClass("is-active");
                $("[data-action='changeCloth']").removeClass("is-active");
            } else if ($(this).attr("data-action") === "changeCloth") {
                $(".communication.changeCloth").show();
                $(".communication.chat").hide();
                $(".communication.meal").hide();
                // is-activeの操作
                $("[data-action='changeCloth']").addClass("is-active");
                $("[data-action='meal']").removeClass("is-active");
                $("[data-action='chat']").removeClass("is-active");
            }
        });
    });
    // 餌をあげる
    $(".meal-list > li").draggable({
        helper: "clone"
    });
    // 着せ替え
    $(".cloth-list > li").draggable({
        helper: "clone"
    });
    
    // http://stacktrace.jp/jquery/ui/interaction/droppable.html
    $(".image-pal").droppable({
        drop: function(e, ui) {
            // 着替え
            if ($(e.originalEvent.target).hasClass("cloth")) {
                // targetにimgタグが格納されてるので、それをコピーする
                $(".kisekae").attr("src", $(e.originalEvent.target).attr("src"));
            } else if ($(e.originalEvent.target).hasClass("cloth-purge")) {
                // はずす
                $(".kisekae").attr("src", "");
            } else if ($(e.originalEvent.target).hasClass("meal"))  {
                // 食事
                // パル喜ぶ
                $(".arrow_box").empty();
                $(".arrow_box").append(ui.helper.data().value + '<i class="fa fa-heart" aria-hidden="true"></i>');
                // お腹を一つ満たす
                var firstNoManpukued = $($(".header-menu").find("li > i.fa-circle-o")[0]);
                if (firstNoManpukued) {
                    firstNoManpukued.removeClass("fa-circle-o");
                    firstNoManpukued.addClass("fa-circle");
                }
            }
        }
    });

    // ナデナデ実装
    $(".nadenade").hide();
    $(".status-smile").hide();
    var counter = 0;
    $(".image-pal").on("touchstart", function(e) {
        counter = 0;
    });
    // こする処理 = 撫でる。
    // 一定時間撫で続けると、「なつき」が上がる
    $(".image-pal").on("touchmove", function(e) {
        $(".nadenade").show();
        counter++;
        if (pal.const.nadenadeTime < counter) {
            counter = 0;
            var firstNoHeart = $($(".header-menu").find("li > i.fa-heart-o")[0]);
            if (firstNoHeart) {
                firstNoHeart.removeClass("fa-heart-o");
                firstNoHeart.addClass("fa-heart");
            }

            $(".status-smile").show();
            setTimeout(function() {
                $(".status-smile").hide();
            }, pal.const.smileTime);
        }
    });
    // なつきは一定時間経過すると減り続ける
    setInterval(function() {
        var index = $(".header-menu").find("li > i.fa-heart").length - 1;
        var firstHearted = $($(".header-menu").find("li > i.fa-heart")[index]);
        if (firstHearted) {
            firstHearted.removeClass("fa-heart");
            firstHearted.addClass("fa-heart-o");
        }
    }, pal.const.haraheriTime);
    // お腹は一定時間放置すると、減り続ける
    setInterval(function() {
        var index = $(".header-menu").find("li > i.fa-circle").length - 1;
        var firstManpukued = $($(".header-menu").find("li > i.fa-circle")[index]);
        if (firstManpukued) {
            firstManpukued.removeClass("fa-circle");
            firstManpukued.addClass("fa-circle-o");
        }
    }, pal.const.natsukiTime);
    $(".image-pal").on("touchend", function(e) {
        $(".nadenade").hide();
    });

    // 会話
    $(".chat-icon").on("click", function() {
        if ($("#chat-text").val()) {
            // 画面操作を無効する
            $(".loading").show();
            lockScreen("doing-ajax");
            $.ajax({
                    url: 'https://manabu-san.herokuapp.com/window/chat.php',
                    type: 'GET',
                    data: {
                        words: $("#chat-text").val(),
                    },
                    dataType: 'json'
                })
                .done(function(data, textStatus, jqXHR) {
                    $(".arrow_box").empty();
                    $(".arrow_box").append(data.result.chat);
                    $("#chat-text").val("");
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    $(".arrow_box").empty();
                    $(".arrow_box").append("現在会話機能が使えません。ごめんね。。");
                    $("#chat-text").val("");
                })
                .always(function(jqXHR, textStatus) {
                    // 読み込みと画面無効化を解除する
                    $(".loading").hide();
                    unlockScreen("doing-ajax");
                });
        }
    });
    
    /**
     * エンターキーでsubmitさせる
     */
    $("input"). keydown(function(e) {
        // エンターキーはchatのトリガーにする
        if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
            // キーボードの出っ放しを防ぐため、focusを外す
            $(this).blur();
            $(".chat-icon").trigger("click");
        }
    });
    
    /*
     * 画面操作を無効にする
     */
    function lockScreen(id) {
        var divTag = $('<div />').attr("id", id);
        divTag.css("z-index", "999")
              .css("position", "absolute")
              .css("top", "0px")
              .css("left", "0px")
              .css("right", "0px")
              .css("bottom", "0px")
              .css("background-color", "gray")
              .css("opacity", "0.8");
        $('body').append(divTag);
    }
 
    /*
     * 画面操作無効を解除する
     */
    function unlockScreen(id) {
        $("#" + id).remove();
    }
    
    /**
     * パルの状態を見て、画像を差し替える
     */
    var palImageInterval = setInterval(function() {
        $("body").show();
        // お腹もなつき度も低い時(絶望的)
        if ($(".header-menu").find("li > i.fa-circle").length <= 1 && $(".header-menu").find("li > i.fa-heart").length <= 1) {
            $(".image-pal").attr("src", "images/shunn.png");
            $(".kisekae").removeClass("pal-default");
            return;
        }
        // 気分最高の時
        if ($(".header-menu").find("li > i.fa-circle").length === 5 && $(".header-menu").find("li > i.fa-heart").length === 5) {
            $(".image-pal").attr("src", "images/pal1.png");
            $(".kisekae").removeClass("pal-default");
            return;
        }
        // お腹だけ減ってる時
        if ($(".header-menu").find("li > i.fa-circle").length <= 1) {
            $(".image-pal").attr("src", "images/harahetta.png");
            $(".kisekae").removeClass("pal-default");
            return;
        }
        // 機嫌だけ悪い時
        if ($(".header-menu").find("li > i.fa-heart").length <= 1) {
            $(".image-pal").attr("src", "images/punpun.png");
            $(".kisekae").removeClass("pal-default");
            return;
        }
        // デフォルト
        $(".image-pal").attr("src", "images/pal.png");
        $(".kisekae").addClass("pal-default");
    }, pal.const.palImageChangeTime);
});