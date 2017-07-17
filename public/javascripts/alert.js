/*
 * 弹框处理类
 */
var Alert = function Alert(options) {
    this.init(options);
};

Alert.prototype = {
    /**
     * options:Alert类的属性
     * checkTable:检验的table的
     * alertDiv:弹框
     * validateForm:需校验的form表单
     * needSelected:是否需要验证至少选择一项
     * needConfirm:是否需要确认提示
     * needValidate：是否需要验证form表单
     * validataFlag:表单验证结果
     * showActionTip:是否显示动作提示
     * headerTip:提示框标题
     * confirmTip:确认提示信息
     * actionTip:动作提示信息
     * confrimAction:确认动作对应的function
     */
    options:{
        checkTable:"",
        alertDiv:"#alertDialog",
        validateForm:"#form",
        needSelected:true,
        needConfirm:true,
        needValidate:false,
        showActionTip:false,
        headerTip:"提示",
        confirmTip:"是否确认删除？",
        actionTip:"",
        confirmAction:function() {}
    },
    /**
     * 初始化函数
     * 获取弹框的各模块并绑定相关事件
     * @param options
     */
    init:function(options) {
        this.setOptions(options);
        this.$alertDialog = $(this.options.alertDiv);
        if (this.$alertDialog.length == 0) {
            $("body").append('<div class="modal" id="alertDialog" tabindex="-1"><div class="modal-dialog" style="width:300px; top:30%;"><div class="modal-content"><div class="modal-header"><h4></h4></div><div class="modal-body"></div><div class="modal-footer" style="text-align:center;"><button class="btn btn-default btn-sm"><span class="glyphicon glyphicon-remove"></span>取消</button><button class="btn btn-primary btn-sm"><span class="glyphicon glyphicon-ok"></span>确认</button></div></div></div></div>');
        }
        this.$alertDialog = $(this.options.alertDiv);
        this.$alertHeader = this.$alertDialog.find(".modal-header h4");
        this.$alertContent = this.$alertDialog.find(".modal-body");
        this.$alertFooter = this.$alertDialog.find(".modal-footer");
        var self = this;
        this.$alertDialog.find(".modal-footer button.btn-default").click(function() {
            self.cancel();
        });
        this.$alertDialog.find(".modal-footer button.btn-primary").click(function() {
            self.confirm();
        });
    },
    /**
     * 设置相关属性
     * @param options
     */
    setOptions:function(options) {
        this.options = $.extend({}, this.options, options);
    },
    /**
     * 执行弹框动作
     * @param options
     */
    check:function(options) {
        this.setOptions(options);
        this.$checkboxs = $(this.options.checkTable).find("tbody td input[type='checkbox']:checked");
        if (this.options.needSelected && this.$checkboxs.length === 0) {
            //需要至少选择一项且一项都没选择
            this.actionFlag = false;
            this.$alertDialog.find(".modal-dialog").width(280);
            this.$alertContent.css("padding", "20px");
            this.$alertHeader.html("警告");
            this.$alertContent.html("请至少选择一项");
            this.$alertFooter.show();
            this.$alertDialog.modal("show");
        } else {
            //不需要至少选择一项或者已选择选项
            this.actionFlag = true;
            if (this.options.needConfirm) {
                //需要弹出确认提示
                this.$alertHeader.html("提示");
                this.$alertContent.html("是否确认删除?");
                this.$alertFooter.show();
                this.$alertDialog.modal("show");
            } else {
                //不需要确认提示
                this.confirm();
            }
        }
    },
    confirm:function() {
        if (this.actionFlag && typeof this.options.confirmAction === "function") {
            if (this.options.needConfirm && this.options.needValidate) {
                var formObj = $(this.options.validateForm).inputValid(valid_message_options);
                if (Boolean(formObj)) {
                    if (formObj.validate_all()) {
                        this.options.confirmAction(this.$checkboxs);
                        this.cancel();
                    } else return;
                } else {
                    this.options.confirmAction(this.$checkboxs);
                    this.cancel();
                }
            } else {
                this.options.confirmAction(this.$checkboxs);
                this.cancel();
                if (this.options.showActionTip) {
                    //需要动作执行提示信息
                    this.$alertDialog.find(".modal-dialog").width(280);
                    this.$alertContent.css("padding", "20px");
                    this.$alertHeader.html(tip_message.tip);
                    this.$alertContent.html(this.options.actionTip);
                    this.$alertFooter.hide();
                    this.$alertDialog.modal("show");
                }
            }
        } else this.cancel();
    },
    cancel:function() {
        this.$alertDialog.modal("hide");
        $(this.options.checkTable + "_headBox table").find("thead th input[type='checkbox']").prop("checked", false);
        $(this.options.checkTable).find("thead th input[type='checkbox']").prop("checked", false);
        this.$checkboxs = $(this.options.checkTable).find("tbody td input[type='checkbox']:checked");
        if (Boolean(this.$checkboxs)) {
            this.$checkboxs.each(function() {
                $(this).prop("checked", false);
            });
        }
    }
};