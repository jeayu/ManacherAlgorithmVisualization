
var TBODY;
var OL;
var _state;
var _timeout;
var _restart = false;


// 回文字符串: 处理后回文字符串的长度一定是奇数
let _manacherString;
// 回文半径: 括回文中心在内的回文子串的一半的长度
let _radius;
// 回文直径: 回文半径的2倍减1
let _diameter;
// 最右回文边界: 在遍历字符串时，每个字符遍历出的最长回文子串都会有个右边界，
// 而R则是所有已知右边界中最靠右的位置，也就是说R的值是只增不减的
let _R;
// 回文中心: 取得当前R的第一次更新时的回文中心
let _C;
// 半径数组: 这个数组记录了原字符串中每一个字符对应的最长回文半径
let _radiusArray;
// 结果
let _ans;

// current index
let _i;
// ans flag
let _start;
let _end;


let _lastI;

const FLAG = '#';
const SPEED = 300;
const [SURE,START,PAUSE,NEXT,END] = ['sure','start','pause','next','end'];


function sure() {
    const str1 = document.getElementById('str1').value;
    if (!str1) {
        addClass(document.getElementById('str1').parentNode, 'has-error');
        return;
    } else {
        removeClass(document.getElementById('str1').parentNode, 'has-error');
    }

    _manacherString = ['', ...str1, ''].join(FLAG);
    _radiusArray = Array(_manacherString.length).fill(0);
    const row = 1;
    const col = _manacherString.length;
    creatTable(row, col, _manacherString);
    // console.log(manacher());
    resetVal();

    setState(SURE);

}

function resetVal() {
    _start = 0;
    _end = -1;
    _C = -1;
    _R = -1;
    _ans = '';
    _i = 0;
    _lastI = _i - 1;
}

// --------------- arithmetic --------------
function manacher() {
    _start = 0;
    _end = -1;
    _C = -1;
    _R = -1;
    _ans = '';
    _i = 0;
    for (_i = 0; _i < _manacherString.length; _i++) {
        let curRadiusArrayLen;
        if (_C >= _i) {
            // 回文直径: 回文半径的2倍减1
            let _diameter = _R * 2 - _i;
            let minRadiusArrayLen = Math.min(_radiusArray[_diameter], _C - _i);
            curRadiusArrayLen = expand(_manacherString, _i - minRadiusArrayLen, _i + minRadiusArrayLen);
        } else {
            curRadiusArrayLen = expand(_manacherString, _i, _i);
        }
        _radiusArray[_i] = curRadiusArrayLen;
        if (_i + curRadiusArrayLen > _C) {
            _R = _i;
            _C = _i + curRadiusArrayLen;
        }
        // 更新最大回文位置
        if (curRadiusArrayLen * 2 + 1 > _end - _start) {
            _start = _i - curRadiusArrayLen;
            _end = _i + curRadiusArrayLen;
        }
    }
    for (let i = _start; i <= _end; i++) {
        if (_manacherString.charAt(i) !== FLAG) {
            _ans += _manacherString.charAt(i);
        }
    }
    return _ans;
}

// 向外扩展, 直到不相等
function expand(s, left, right) {
    while (left >= 0 && right < s.length
    && s.charAt(left) === s.charAt(right)) {
        left--;
        right++;
    }
    return (right - left - 2) / 2;
}

// ---------------------------------------------

function solve() {
    step() || stepEnd();
}

function step() {
    if (_i >= _manacherString.length) {
        end();
        return false;
    }
    if (_i === _lastI) {
        return false;
    }
    select();
    _lastI = _i;
    let curRadiusArrayLen;
    if (_C >= _i) {
        // 回文直径: 回文半径的2倍减1
        let _diameter = _R * 2 - _i;
        let minRadiusArrayLen = Math.min(_radiusArray[_diameter], _C - _i);
        curRadiusArrayLen = expandAnimation(minRadiusArrayLen);
    } else {
        curRadiusArrayLen = expandAnimation();
    }
    _radiusArray[_i] = curRadiusArrayLen;
    updateRadiusArray();
    if (_i + curRadiusArrayLen > _C) {
        _R = _i;
        _C = _i + curRadiusArrayLen;
    }
    if (curRadiusArrayLen * 2 + 1 > _end - _start) {
        _start = _i - curRadiusArrayLen;
        _end = _i + curRadiusArrayLen;
    }
    return true;
}

function stepEnd() {
    if (_state !== PAUSE && _state !== END) {
        removeSelect();
        removeAllSelect();
    }
    _i++;
}

function expandAnimation(minRadiusArrayLen = 0) {
    let left = _i;
    let right = _i;
    if (minRadiusArrayLen > 0) {
        left -= minRadiusArrayLen;
        right += minRadiusArrayLen;
        drawRadius(minRadiusArrayLen);
    }
    while (left >= 0 && right < _manacherString.length
    && _manacherString.charAt(left) === _manacherString.charAt(right)) {
        left--;
        right++;
        selectLeftRight(left, right);
    }
    return (right - left - 2) / 2;
}


function ans() {
    for (let i = _start; i <= _end; i++) {
        if (_manacherString.charAt(i) !== FLAG) {
            _ans += _manacherString.charAt(i);
        }
    }
    appenText(`answer: ${_ans}`);
    drawAns();
}

// ----------------------------------------

function appenText(text) {
    const li = document.createElement('li');
    li.innerHTML = text;
    OL.appendChild(li);
    li.scrollIntoView();
}
function removeTimeout() {
    if (_timeout) {
        clearTimeout(_timeout);
        _timeout = null;
    }
}

function start() {
    if (_state === PAUSE && !_restart) {
        return;
    }
    _restart = false;
    setState(START);
    solve();
    if (_state !== END) {
        _timeout = setTimeout(start, SPEED);
    }

}

function pause() {
    setState(PAUSE);
    _restart = true;
    removeTimeout();
}

function end() {
    setState(END);
    _restart = true;
    removeTimeout();
    ans();
}

function next() {
    if (_state === END) {
        return;
    }
    solve();
    setState(NEXT);
}

function setState(newState) {
    _state = newState;
    document.getElementById(SURE).disabled = _state === START || _state === PAUSE || _state === NEXT;
    document.getElementById(START).disabled = _state === START || _state === END;
    document.getElementById(PAUSE).disabled = _state === NEXT|| _state === SURE || _state === PAUSE || _state === END;
    document.getElementById(NEXT).disabled = _state === START || _state === END;
}

function creatTable(row, col, str1) {
    //删除旧表格
    if (document.getElementById('manacher') != null) {
        document.getElementById('table').removeChild(document.getElementById('manacher'));
    }
    //删除旧ol列表
    if (OL) {
        var ol = document.createElement('ol');
        var info = document.getElementById('info');
        info.removeChild(OL);
        info.appendChild(ol);
    }
    removeClass(document.getElementById('info'), 'info');
    OL = document.getElementById('info').getElementsByTagName("ol")[0];

    //开始创建table
    var table = document.createElement("table");
    table.setAttribute("cellspacing", "0");
    table.setAttribute("id", "manacher");
    var tbody = document.createElement("tbody");
    var len = str1.length;

    //创建表格
    for (i = 0; i < 3; i++) {
        //创建tr
        var tr = document.createElement("tr");
        for (j = 0; j < len; j++) {

            var td = document.createElement("td");
            td.innerHTML = '&nbsp';
            tr.appendChild(td);
            if (i === 0) {
                addClass(td, 'index-td');
                td.innerHTML = j;
            }
            if (i === 1) {
                addClass(td, 'top-td base-td');
                td.innerHTML = str1[j];
            }
            if (i === 1 && j === 0) {
                addClass(td, 'left-td');
            }
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    document.getElementById('table').appendChild(table);
    TBODY = tbody;
    document.getElementById('info').style.height = document.getElementById('table').offsetHeight - 75 + 'px';

}


function removeSelect() {
    _i > -1 && removeClass(TBODY.rows[2].cells[_i], 'select-char');
}

function select() {
    _i > -1 && addClass(TBODY.rows[2].cells[_i], 'select-char');
}

function removeAllSelect() {
    for (let i = 0; i < _manacherString.length; i++) {
        removeClass(TBODY.rows[1].cells[i], 'select-char');
        removeClass(TBODY.rows[1].cells[i], 'select-td');
        removeClass(TBODY.rows[2].cells[i], 'select-char');
    }
}

function selectLeftRight(left, right) {
    checkIndex(left) && addClass(TBODY.rows[1].cells[left], 'select-char');
    checkIndex(right)  && addClass(TBODY.rows[1].cells[right], 'select-char');
}

function drawRadius(radius) {
    for (let i = 1; i <= radius; i++) {
        addClass(TBODY.rows[1].cells[_i+i], 'select-td');
        addClass(TBODY.rows[1].cells[_i-i], 'select-td');
    }

}

function drawAns() {
    for (let i = _start; i <= _end; i++) {
        addClass(TBODY.rows[1].cells[i], 'select-td');
    }

}

function updateRadiusArray() {
    TBODY.rows[2].cells[_i].innerHTML = _radiusArray[_i];
}

function checkIndex(index) {
    return index >=0 && index < _manacherString.length
}

function hasClass(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

function addClass(obj, cls) {
    if (!this.hasClass(obj, cls)) {
        obj.className += " " + cls;
    }
}

function removeClass(obj, cls) {
    if (hasClass(obj, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        obj.className = obj.className.replace(reg, ' ');
    }
}