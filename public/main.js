/**
 * Created by xiayf on 15/12/4.
 */
var $ = jQuery = require('jquery');
var _ = require('cn-bootstrap-datetimepicker');
var Highcharts = require('highcharts');
Highcharts.setOptions({ global: { useUTC: false } });

var statTitleMapper = {
    'connected_client': '客户端连接数(个)',
    'used_memory': '内存使用量(MB)'
};

$(function () {
    $('#begin_datetime').datetimepicker({
        format: 'YYYY-MM-DD HH:mm:ss'
    });
    $('#end_datetime').datetimepicker({
        format: 'YYYY-MM-DD HH:mm:ss'
    });

    $('#submit_cmd').on('click', function ($e) {
        $e.preventDefault();
        $('#cmd_output').empty();

        var cmd = $('input[name="cmd"]').val(),
            cmdParts = cmd.split(' '),
            params = '';
        cmd = cmdParts[0];
        if (cmdParts.length > 1) {
            params = cmdParts.slice(1).join(' ');
        }

        var req = $.ajax({
            "method": "POST",
            "url": "/cmd",
            "data": {
                "cmd": cmd,
                "params": params
            },
            dataType: "text"
        });
        req.done(function (resp) {
            resp = '<pre>' + resp + '</pre>';
            $('#cmd_output').html(resp);
        });
    });

    $('#show_stat').on('click', function ($e) {
        $e.preventDefault();

        var selectedServer = [];
        $('.server input').each(function () {
            if ($(this).prop('checked')) {
                selectedServer.push($(this).val());
            }
        });

        var selectedIndex = [];
        $('.index input').each(function () {
            if ($(this).prop('checked')) {
                selectedIndex.push($(this).val());
            }
        });

        var beginDateTime = $('input[name="begin-datetime"]').val();
        var endDateTime = $('input[name="end-datetime"]').val();

        // 一个指标一张图
        $('.stat-graph-part').empty();

        selectedIndex.forEach(function (ele) {
            var req = $.ajax({
                method: 'POST',
                url: "/stat",
                data: {
                    name: ele,
                    servers: selectedServer.join(','),
                    begin_time: beginDateTime,
                    end_time: endDateTime
                },
                dataType: 'json'
            });
            req.done(function (resp) {
                var containerID = 'container_' + ele;
                $('.stat-graph-part').append('<div id=' + containerID + '></div>');

                $('#' + containerID).highcharts({
                    credits: {
                      enabled: false
                    },
                    title: {
                        text: statTitleMapper[ele]
                    },
                    xAxis: {type: 'datetime'},
                    series: resp
                });
            });
        });
    });
});