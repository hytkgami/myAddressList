// フォームの値をクリアする
var clearForm = function () {
  $("#name").val('');
  $("#pref").val('');
  $("#address1").val('');
  $("#address2").val('');
  $("#birthday").val('');
}

/*
 * 配列を受け取って表を作成する
 * @params data 行に表示するデータの配列
*/
var insertRow = function (data) {
  var _tmp = "";
  for(var item in data) {
    console.log("##################", $.type(data[item]));
    _tmp += '<td>'
    if($.type(data[item]) == "date") {
      var day = data[item];
      _tmp += ([day.getFullYear(), day.getMonth() + 1, day.getDate()].join("/"));
    } else {
      _tmp += data[item];
    }
    _tmp += '</td>';
  }
  $("#addressList tbody").append('<tr>'+_tmp+'</tr>');
}

/*
 * セレクトタグの選択肢をセットする
 * @params options フォームにセットするデータの配列
*/
var setSelectTag = function (options) {
  $("#search").empty(); // 子要素を削除
  $("#search").append($('<option>').val(0).text("すべて"));
  for (var i=1; i <= options.length; i++) {
    $("#search").append($('<option>').val(i).text(options[i-1].toString()));
  };
}

/*
 * テーブルに表示するデータを受け取る
 * @params data テーブルに表示するデータの配列
*/
var updateTable = function (data) {
  var table = $("#addressList tbody");
  table.empty(); // 現在あるテーブルをすべてクリア
  var header = '<th>名前</th><th>住所</th><th>誕生日</th><th>年齢</th>';
  table.append(header);
  for (var i = 0; i < data.length; i++) {
    insertRow(data[i]);
  };
}

$(function () {
  // アドレスクラス
  var Address = (function () {
    // constructor
    var count = 0;
    var Address = function() {
      this.name = "";
      this.pref = "";
      this.add1 = "";
      this.add2 = "";
      this.birthday = new Date();
    }
    return Address;
  })();

  var ap = Address.prototype;
  /*
   * アドレスをセットする
   * @params name 名前
   * @params pref 都道府県
   * @params add1 市区
   * @params add2 町村番地
   * @params birthday 誕生日
  */
  ap.set = function (name, pref, add1, add2, birthday) {
    this.name = name;
    this.pref = pref;
    this.add1 = add1;
    this.add2 = add2;
    var address = pref + add1 + add2;
    this.birthday = new Date(birthday); // Dateオブジェクトとして保存
    ++Address.count;
  }

  /*
   * アドレスデータを取得する
   * return [名前, 住所, 誕生日, 年齢]
  */
  ap.get = function () {
    return new Array(this.name, this.pref + this.add1 + this.add2, this.birthday, this.getAge());
  }

  /*
   * 満年齢を算出する 
   * return age 年齢
  */
  ap.getAge = function () {
    var now = new Date();
    var bd = this.birthday;
    var age = now.getFullYear() - bd.getFullYear();
    if(bd.getMonth() > now.getMonth()) {
      return age - 1;
    }
    return age;
  }

  // バリデート用オブジェクト
  var Validate = new Object({
    chkBlank: function () {
      var blank = /[^\s*]/;
      // DOM要素の値を取得
      var name = $("#name");
      var pref = $("#pref");
      var add1 = $("#address1");
      var add2 = $("#address2");
      var birthday = $("#birthday");
      var cnt = 0;
      var tmp = new Array(name, pref, add1, add2, birthday);
      var msg = '<td class="red">未入力項目</td>' 
      $(".red").each(function () {
        $(this).remove();
      });
      for (var i = 0; i < tmp.length; i++) {
          var parent = tmp[i].parent();
        if(!blank.test(tmp[i].val())) {
          parent.addClass("invalid");
          parent.after(msg);
          cnt++;
        } else {
          parent.removeClass("invalid");
          $(".red").eq(i).remove();
        }
      }; 
      if(cnt > 0) {
        return false;
      } else {
        return true;
      }
    },
    chkDate: function () {
      var dateFormat = /\d{4}\/\d{2}\/\d{2}/;
      var birthday = $("#birthday");
      if(!dateFormat.test(birthday.val())) {
        birthday.parent().addClass("invalid");
        console.log("chkDate() => inValid");
        return false;
      } else {
        birthday.parent().removeClass("invalid");
        return true;
      }
    }
  });

  var list = new Array; // アドレスインスタンスを格納しておく
  var options = new Array; // セレクトタグの中身
  var table = new Array; // テーブルに表示する全データを管理

  /* DOM操作 */
  $("#submit").on("click", function() {
    var a = new Address();
    var name = $("#name").val();
    var pref = $("#pref").val();
    var add1 = $("#address1").val();
    var add2 = $("#address2").val();
    var birthday = $("#birthday").val();
    if(Validate.chkBlank() && Validate.chkDate()) {
      a.set(name, pref, add1, add2, birthday);
      var row = a.get();
      table.push(row);
      updateTable(table);
      list.push(a); // オブジェクトを格納
      // ユニークチェック
      if($.inArray(pref, options) === -1) {
        options.push(pref);
      }
      setSelectTag(options);
      clearForm(); 
    }
  });

  $("#debug").on("click", function () {
    console.log("list配列 =>" , list);
    console.log("list配列の件数 =>", list.length);
    console.log("options配列 =>", options);
    console.log("セレクトタグの中身");
    console.log($("#search"));
    console.log("table配列 => ", table);
  });

  $("#search").on("change", function () {
    if($("#search").val() === "0") {
      updateTable(table);
    } else {
      var _tmp = new Array();
      for (var i = 0; i < list.length; i++) {
        if(list[i]["pref"] === $("#search option:selected").text()) {
          console.log("list[", i , "] => ", list[i]);
          _tmp.push(list[i].get());
        }
      }
      updateTable(_tmp);
    }
  });

  $(".sort input[name='sortType']").on("click", function () {
    var type = $(".sort input[name='sortType']:checked").val();
    switch (type) {
      case "0":
        updateTable(table.slice().sort(function (a, b) {
          return (a[2] < b[2]) ? -1 : 1;
        }));
        break;
      case "1":
        updateTable(table.slice().sort(function (a, b) {
          return (a[2] > b[2]) ? -1 : 1;
        }));
        break;
      case "2":
        updateTable(table);
        break;
    }
  });
});