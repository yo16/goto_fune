/*
goto timetables main
(c) 2022 yo16
*/
$(function(){
    $("#sel_departure").append(
        $("<option></option>")
            .attr("selected","true")
            .val("-1")
            .text("（未選択）")
    );
    $("#sel_arrival").append(
        $("<option></option>")
            .attr("selected","true")
            .val("-1")
            .text("（未選択）")
    );

    for( const g of PORT_GROUP ){
        let og1 = $("<optgroup></optgroup>")
            .attr("label", g["name"])
        ;
        let og2 = $("<optgroup></optgroup>")
            .attr("label", g["name"])
        ;

        for( const p of PORTS ){
            if( g.id == p.group ){
                og1.append(
                    $("<option></option>")
                        .val(p["id"])
                        .text(p["name"])
                );
                og2.append(
                    $("<option></option>")
                        .val(p["id"])
                        .text(p["name"])
                );
            }
        }

        $("#sel_departure").append(og1);
        $("#sel_arrival").append(og2);
    }
    $("#sel_departure").change(function(){search_cur_sel();});
    $("#sel_arrival").change(function(){search_cur_sel();});
    
    // 出発日は今日
    let dt = new Date();
    let m = ("0" + (dt.getMonth()+1)).slice(-2);
    let d = ("0" + dt.getDate()).slice(-2);
    let str_dt = dt.getFullYear() + "-" + m + "-" + d;
    $("#in_dep_date").val(str_dt);
});

function btn_search(){
    search_cur_sel();
};

function search_cur_sel(){
    let dep = $("#sel_departure").val();
    let arr = $("#sel_arrival").val();
    let dep_dt = new Date($("#in_dep_date").val());

    let div_res = $("#search_result");
    div_res.empty();

    if(dep<0 && arr<0){return;}
    
    let search_result_objs = [];
    for(let com of TIMETABLE_MASTER){
        let cur_com = SHIP_COMPANY.find((mst_c) => mst_c.id==com["ship_company"]);
        for(let s of com["ships"]){
            // 日付の範囲チェック
            let is_target = false;
            for(let per of s["periods"]){
                let from_dt = to_date(per["from"]);
                let to_dt = to_date(per["to"]);
                if( (from_dt<=dep_dt) && (dep_dt<=to_dt)){
                    is_target = true;
                }
            }
            if(!is_target){continue;}

            let ship_first_disp = true;
            let all_plan_first_disp = true;
            for(let p of s["plans"]){
                if(dep>=0){
                    if(p["from"]!=dep){
                        continue;
                    }
                }
                if(arr>=0){
                    if(p["to"]!=arr){
                        continue;
                    }
                }

                // 表示対象
                let cur_port_from = PORTS.find((mst_p) => mst_p.id==p["from"]);
                let cur_port_to   = PORTS.find((mst_p) => mst_p.id==p["to"]);

                for(let tm of p["timetable"]){
                    search_result_objs.push({
                        "departure_tm_str"  : tm["departure"],
                        "arrival_tm_str"    : tm["arrival"],
                        "departure_tm"      : to_time(tm["departure"]),
                        "arrival_tm"        : to_time(tm["arrival"]),
                        "departure_port"    : cur_port_from["name"],
                        "arrival_port"      : cur_port_to["name"],
                        "ship_title"        : s["title"],
                        "timetable_url"     : s["timetable_url"],
                        "company"           : cur_com
                    });
                }
            }
        }
    };

    // 出発時刻でソート
    search_result_objs.sort(function(f,s){
        if(f["departure_tm"]<s["departure_tm"]){
            return -1;
        }else if(f["departure_tm"]>s["departure_tm"]){
            return 1;
        }
        return 0;
    });

    // 表示
    let result_tbl = $("<table></table>")
        .attr("id", "tbl_result")
        .append($("<tr></tr>")
            .append($("<th></th>").text("出発"))
            .append($("<th></th>"))
            .append($("<th></th>").text("到着"))
            .append($("<th></th>").text("船便"))
            .append($("<th></th>").text("時刻表"))
    );
    for( let res of search_result_objs){
        result_tbl.append($("<tr></tr>")
            .append($("<td></td>")
                .text("("+res["departure_tm_str"]+") " + res["departure_port"])
            )
            .append($("<td></td>")
                .text("→")
            )
            .append($("<td></td>")
                .text("("+res["arrival_tm_str"]+") " + res["arrival_port"])
            )
            .append($("<td></td>")
                .append($("<a></a>")
                    .attr("href", res["company"]["top_url"])
                    .text(res["company"]["name"])
                )
                .append($("<span></span>")
                    .text(": " + res["ship_title"])
                )
            )
            .append($("<td></td>")
                .append($("<a></a>")
                    .attr("href", res["timetable_url"])
                    .attr("target", "_blank")
                    .text("(時刻表link)")
                )
            )
        );
    }

    div_res.append(result_tbl);
};

function to_date(s){
    let ymd = s.split('/');
    let ymd_str = ymd[0] + "-" + ("0"+ymd[1]).slice(-2) + "-" + ("0"+ymd[2]).slice(-2);
    return new Date(ymd_str);
}

function to_time(s){  // てきとう
    let hm = s.split(':');
    let hm_str = "" + hm[0] + hm[1];
    return Number(hm_str);
}
