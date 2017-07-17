var editor;
KindEditor.ready(function(K) {
    editor =K.create('textarea[name="post_content"]', {
        uploadJson: '/uploadImg',
        resizeType : 1,
        urlType : 'domain',
        autoHeightMode : false,
        filterMode : false,
        afterCreate : function() {
            this.loadPlugin('autoheight');
        },
        allowPreviewEmoticons : false,
        allowImageUpload : false,
        pasteType : 2,
        items : ['source','preview','filterhtml','nofilterhtml','|',
            'formatblock','fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline',
            'removeformat','quickformat','plainpaste','|', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist',
            'insertunorderedlist','indent','outdent','lineheight','|', 'link','image','images','medias']
    });

});
//上传按钮
KindEditor.plugin('images', function(K) {
    var editor = this, name = 'images';
    // 点击图标时执行
    editor.clickToolbar(name, function() {
        $("#modal_pics_editor").modal('show');
        var data = {};
        get_editor_pics_count(data);
        get_editor_pics_list(data);
        $("#pics_deitor_find").on("click", function () {
            var data = { title: $("#post_pics_find_title").val() };
            get_editor_pics_count(data);
            get_editor_pics_list(data);
        });
    });
    $(document).on("click", ".editor_pics", function () {
        var src=$(this).attr("src")
        editor.insertHtml('<p><img style="width:100%" src='+src+'></p>');
        effect.success('添加成功')
    })
    //本地上传--图片
    $('#editor_pics_upload').fileupload({
        url: '/upload',
        dataType: 'json',
        acceptFileTypes:  /(\.|\/)(gif|jpe?g|png)$/i,
        add: function (e, data) {
            var goUpload = true;
            var file = data.files[0];
            console.log(file);
            if (file.size > 1024*1024*5) {
                goUpload = false;
                console.log(file.name, "上传文件不能超过 5MB");
            } else {
                console.log(file.name, "正在上传");
            }
            if (goUpload) {
                data.submit();
            }
        },
        submit:function(e,data){},
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                editor.insertHtml('<p><img style="width:100%" src='+file.path+'></p>');
            });
            $('#modal_pics_editor').modal("hide");

        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
});
KindEditor.lang({
    images : '图片'
});
//视频按钮
KindEditor.plugin('medias', function(K) {
    var editor = this, name = 'medias';
    // 点击图标时执行
    editor.clickToolbar(name, function() {
    	$("#modal_video_editor").modal('show');
        var data = {columnid:-1};
        get_editor_videos_count(data);
        get_editor_videos_list(data);
        $("#video_deitor_find").on("click", function () {
	        var data = { title: $("#video_deitor_find_title").val(),columnid:-1 };
	        get_editor_videos_count(data);
	        get_editor_videos_list(data);
        });
    });
    $(document).on("click", ".editor_video", function () {
        var src=$(this).attr("data-video");
        var pics=$(this).attr("data-pics");
    	editor.insertHtml('<p><video src='+src+' controls="controls" poster='+pics+'></video></p></br>');
        $('#modal_video_editor').modal("hide");
    })
    //本地上传--视频
    $('#editor_video_upload').fileupload({
        url: '/upload',
        dataType: 'json',
        add: function (e, data) {
            var goUpload = true;
            var file = data.files[0];
            console.log(file);
            if (file.size > 1024*1024*700) {
                goUpload = false;
                console.log(file.name, "上传文件不能超过 700MB");
            } else {
                console.log(file.name, "正在上传");
            }
            if (goUpload) {
                data.submit();
            }
        },
        submit:function(e,data){},
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                editor.insertHtml('<p><video src='+file.path+' controls="controls" poster=""></video></p></br>');
            });
            $('#modal_video_editor').modal("hide");

        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
});
KindEditor.lang({
    medias : '视频'
});
//控制过滤
KindEditor.plugin('filterhtml', function(K) {
    var editor = this, name = 'filterhtml';
    // 点击图标时执行
    editor.clickToolbar(name, function() {
        editor.pasteType=2,
        editor.filterMode=false
    });
});
KindEditor.lang({
    filterhtml : '关闭过滤'
});
KindEditor.plugin('nofilterhtml', function(K) {
    var editor = this, name = 'nofilterhtml';
    // 点击图标时执行
    editor.clickToolbar(name, function() {
        editor.pasteType=1,
        editor.filterMode=true
    });
});
KindEditor.lang({
    nofilterhtml : '纯文本模式'
});


//调用自由视频和图片
function get_editor_pics_count(data) {
    $.get('/admin/attachs_ajax_get_count', data, function (result) {
        //分页功能
        var options = {
            currentPage: 1,
            totalPages: result.message.pagecount,
            numberOfPages: result.message.pagesize,
            bootstrapMajorVersion: 1,
            onPageClicked: function (e, originalEvent, type, page) {
                data.page = page;
                get_editor_pics_list(data)
            }
        }
        if(options.totalPages > 0){
            $('#page_pics_deitor').show().bootstrapPaginator(options);
        }else{
            $('#page_pics_deitor').hide();
        }
    });
}
function get_editor_pics_list(data) {
    $.get('/admin/attachs_ajax_get_list', data, function (result) {
        if (result.code == 0) {
            console.log(result);
            $("#modalbody_pics_editor").html('');
            $("#post_editor_pics_tpl")
                    .tmpl(result.message)
                    .appendTo("#modalbody_pics_editor");
        }
    });
}
function get_editor_videos_count(data) {
    $.get('/admin/videos_ajax_get_addcount', data, function (result) {
        //分页功能
        var options = {
            currentPage: 1,
            totalPages: result.message.pagecount,
            numberOfPages: result.message.pagesize,
            bootstrapMajorVersion: 1,
            onPageClicked: function (e, originalEvent, type, page) {
                data.page=page;
                get_editor_videos_list(data);
            }
        }
        if(options.totalPages > 0){
            $('#page_video_deitor').show().bootstrapPaginator(options);
        }else{
            $('#page_video_deitor').hide();
        }
    });
}
function get_editor_videos_list(data) {
    $.get('/admin/videos_ajax_get_addlist', data, function (result) {
        console.log(result);
        if (result.code == 0) {
            $("#modalbody_video_editor").html('');
            $("#post_editor_video_tpl")
                    .tmpl(result.message)
                    .appendTo("#modalbody_video_editor");
        }
    });
}