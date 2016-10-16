var myfilms;

$.ajax({
              method: "POST",
              url: "http://localhost:3000/give",
              async: false
            })
            .done(function( table ) {
                myfilms = JSON.parse(table);
              });


window.ee = new EventEmitter();

var Add = React.createClass({

    getInitialState: function() {
        return {
            filmIsEmpty: true
        };
    },

    onFieldChange: function(fieldName, e) {
        var next = {};
        if (e.target.value.trim().length > 0) {
            next[fieldName] = false;
            this.setState(next);
        } else {
            next[fieldName] = true;
            this.setState(next);

        }
    },

    componentDidMount: function () { //ставим фокус в input
        ReactDOM.findDOMNode(this.refs.author).focus();
    },

    SaveClick: function(e) {
        e.preventDefault();
        var format = $('input[name=format]:checked').val() 
        var idfilm = Date.now();
        var yearEL = ReactDOM.findDOMNode(this.refs.year);
        var filmEl = ReactDOM.findDOMNode(this.refs.film);
        var authorEl = ReactDOM.findDOMNode(this.refs.author);

        var year = yearEL.value,
            film = filmEl.value,
            author = authorEl.value;

        var item = [{
            idfilm: idfilm,
            year: year,
            film: film,
            author: author,
            format: format
        }];

        $.ajax({
              method: "POST",
              url: "http://localhost:3000/write",
              data: item[0]
            })
              /*.done(function( msg ) {
                var data = JSON.parse(msg);
                var hello = data[0];
                alert( "Data Saved: " + hello.name);
              });*/


        yearEL.value = '';
        filmEl.value = '';
        authorEl.value = '';

        window.ee.emit('Film.add', item);
        this.setState({filmIsEmpty: true});
    },
    
     

    SortClick: function(e) {
            e.preventDefault();
           
            
            myfilms.sort(function(a, b) {
                var one = a.film.toLowerCase(),
                    two = b.film.toLowerCase();

                 if (one < two) {
                    return -1;
                 } else if (one > two) {
                    return 1;
                 };

                 return 0;  

            });

            window.ee.emit('FilmSort.add', myfilms);
    },

    onCheckRuleClick: function (e) {
        ReactDOM.findDOMNode(this.refs.alert_button).disabled = !e.target.checked;
    },

    onFilmFind: function(e) {
    	var filmname = ReactDOM.findDOMNode(this.refs.findfilm);
    	var	filmval = filmname.value;

    	if (filmval == "") {
    		window.ee.emit('FilmSort.add', myfilms);
    	} else {
    		var arrnew = [];
    		var about = $('input[name=find]:checked').val()   

                if (about == "film") {
                    for (var i = 0; i < myfilms.length; i++) {
                           var search = myfilms[i].film;
                           if (search.indexOf(filmval) !== -1) {
                                 arrnew.push(myfilms[i]);
                                 window.ee.emit('FilmSort.add', arrnew);
                             };
                         };
                } else {
                    for(var i = 0; i < myfilms.length; i++) {
                         var actor = myfilms[i].author;
                         if (actor.indexOf(filmval) !== -1) {
                            arrnew.push(myfilms[i]);
                            window.ee.emit('FilmSort.add', arrnew);
                        };
                    };
                };


         	};

    },

    render: function () {
        var filmIsEmpty = this.state.filmIsEmpty;
        return (
            <form className='add cf'>
            <div className="ui two column stackable padded grid">
                    <div className="olive column fixed-width">
                      <div className="ui list">
                        <div className="ui input item">
                            <input
                                type="number"
                                min="1900"
                                max="2017"
                                className='add__author'
                                defaultValue=''
                                placeholder='Год выхода'
                                ref='year'
                            />
                        </div>
                        <div className="ui input item">
                            <input
                                type='text'
                                className='add__author'
                                defaultValue=''
                                placeholder='Название фильма'
                                ref='film'
                                onChange={this.onFieldChange.bind(this, 'filmIsEmpty')}
                            />
                        </div>
                        <div className="ui input item">
                            <input
                                className='add__text'
                                defaultValue=''
                                placeholder='Актеры'
                                ref='author'
                            ></input>
                         </div>
                        <div className="ui input item">
                            <input type="radio" name="format" value="dvd" defaultChecked />DVD<br/>
                            <input type="radio" name="format" value="vhs" />VHS<br/>
                            <input type="radio" name="format" value="blu-ray" />Blu-Ray<br/>
                        </div>
                            <button onClick={this.SaveClick} ref="alert_button" className="ui teal small button" disabled={filmIsEmpty}>Сохранить</button>
                        </div>
                     </div>
                        <div className={"pink column " + "fixed-width"}>
                            <div className="ui list">
                                    <button onClick={this.SortClick} ref="alert_button" className="ui teal small button">Сортировать А-Я</button>
                                 <div className="ui input item">
                                    <input
                                        type='text'
                                        className='add__author item'
                                        defaultValue=''
                                        placeholder='Поиск'
                                        ref='findfilm'
                                        onChange={this.onFilmFind}
                                    />
                                </div>
                                    <div className="ui input item">
                                        <input type="radio" name="find" value="film" defaultChecked />По фильму<br/>
                                        <input type="radio" name="find" value="actor" />По актеру
                                     </div>
                                </div>
                        </div>
                </div>
            </form>
        );
    }
});

var Fileset = React.createClass({

    Upload: function(e) {
        e.preventDefault();
        var newfilms;
        var formData = new FormData($('#formfile')[0]);
        $.ajax({
                 type: "POST",
                processData: false,
                contentType: false,
                url: "http://localhost:3000/getfile",
                data:  formData
                }).done(function() {
                   $.ajax({
                          method: "POST",
                          url: "http://localhost:3000/give"
                        })
                        .done(function( table ) {
                            newfilms = JSON.parse(table);
                            window.ee.emit('FilmSort.add', newfilms);    
                          });
                }).fail(function()  {
                   console.log("Sorry. Server unavailable. ");
                }); 

    },






    render: function() {
        return (

                    <form id="formfile" encType="multipart/form-data">
                        <div className="ui action input">
                            <input type="file" name="ava"/>
                            <button className="ui inverted blue button" onClick={this.Upload} >Загрузить</button>
                        </div>
                    </form>

            );
    }
});



var Article = React.createClass({

    propTypes: {
        data: React.PropTypes.shape({
            film: React.PropTypes.string.isRequired,
        })
    },
    getInitialState: function() {
        return {
            visible: false
        };
    },

    readmoreClick: function(e) {
        e.preventDefault();
        if ( this.state.visible == true ) {
           this.setState({visible: false}); 
           var more = ReactDOM.findDOMNode(this.refs.more);
           more.innerHTML = "Подробнее";
        } else {
        
        var more = ReactDOM.findDOMNode(this.refs.more);
        more.innerHTML = "Скрыть";
        this.setState({visible: true});
        
        };

    },

    delete: function(e) {
       $.ajax({
              method: "POST",
              url: "http://localhost:3000/delete",
              data: {idfilm: this.props.data.idfilm}
            });         


        var id = this.props.data.idfilm;

    		for(var i = 0; i < myfilms.length; i++) {
    			var search = myfilms[i].idfilm;
    			if (search == id) {
    				myfilms.splice(i, 1);
    				console.log(1)
    				
    			} 
    			
    		};
    		window.ee.emit('FilmSort.add', myfilms);	
    },

    render:  function () {


        var year = this.props.data.year,
            film = this.props.data.film,
            idfilm = this.props.data.idfilm,
            visible = this.state.visible,
            format = this.props.data.format,
            author = this.props.data.author;

        return (
            <div className='article centermain'>
                {/*<p ref="myid" className={"idfilms " + ((idfilm == '') ? "none":'')}>{idfilm}</p>*/}
                <p className="news__text">{film}</p>
                <p className={'news__idfilm ' + (visible ? '':'none')}>id: {idfilm}</p>
                <p className={"news__author " + ((visible && year !== '') ? '':'none')}>Год: {year}</p>
                <p className={'news__big-text ' + (visible ? '':'none')}>Актеры: {author}</p>
                <p className={'news__format ' + (visible ? '':'none')}>Формат: {format}</p>
                <a href="#"
                   onClick={this.readmoreClick}
                   className="ui primary button mini" ref="more">Подробнее</a>
                <button onClick={this.delete} className="ui red button mini">Удалить</button>
            </div>
        )
    }
});

var News = React.createClass({

    propTypes: {
        data: React.PropTypes.array.isRequired
    },

    render: function() {
      var data = this.props.data;
      var newsTemplate;

        if (data.length > 0) {
            newsTemplate = data.map(function (item, index) {
                return (
                    <div key={index}>
                        <Article data={item} />
                    </div>
                )
            })
        } else {
            newsTemplate = <p>Фильмов нет</p>
        }

        return (
            <div className="news">
                {newsTemplate}
                <strong className={'news__count colortext' + (data.length > 0 ? '':'none')}> Всего фильмов: {data.length}</strong>
            </div>
        );
    }
});

var App = React.createClass({

    getInitialState: function () {
        return {
            films: myfilms
        }
    },

    componentDidMount: function () {
        var self = this;
        window.ee.addListener('Film.add', function (item) {
            var nextFilm = item.concat(self.state.films);
            self.setState({films: nextFilm});
            myfilms.push(item[0]);
        });

        window.ee.addListener('FilmSort.add', function (item) {
            self.setState({films: item});

        });
    },

    componentWillUnmount: function () {
        window.ee.removeListener('Film.add');
    },


    render: function() {
        return (
            <div className="centermain">
                <Add/>
                <Fileset/>
               <h3 className="colortext"> Фильмы </h3>
                <News data={this.state.films}/>
            </div>
        );
    }
});
ReactDOM.render(
    <App />,
    document.getElementById('root')
);