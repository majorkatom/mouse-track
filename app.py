from flask import Flask, render_template, request, redirect, session, send_file
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from io import StringIO, BytesIO
import csv
import os

app = Flask(__name__)

# CONFIG
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
database_uri = os.environ.get('DATABASE_URL')
if database_uri.startswith('postgres://'):
    database_uri = database_uri.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_uri

# DATABASE MODELS
db = SQLAlchemy(app)

class Tiles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    visitor = db.Column(db.String(5), nullable=False)
    typ = db.Column(db.String(20), default='')
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    mouse_data = db.Column(db.JSON, nullable=False)

    def __repr__(self):
        return f" Tiles(visitor='{self.visitor}', type='{self.typ}', date='{self.date}')>"

class Reaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    visitor = db.Column(db.String(5), nullable=False)
    typ = db.Column(db.String(20), default='')
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    reaction_data = db.Column(db.JSON, nullable=False)

    def __repr__(self):
        return f"<Reaction(visitor='{self.visitor}', type='{self.typ}', date='{self.date}')>"

# ROUTES
@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        session['visitor'] = request.form['visitor']
        session['type'] = request.form['type']
        if session['type'] == '':
            session.clear()
            return redirect('/')
        else:
            return redirect('/tiles')
            
    else:
        if 'finished' in session:
            return redirect('/completed')
        else:
            return render_template('index.html')


@app.route('/tiles', methods=['POST', 'GET'])
def tiles():
    if request.method == 'POST':
        mouse_data = request.json

        click_num = len(mouse_data['tileClicks']) == 9
        click_order = True
        for index, click in enumerate(mouse_data['tileClicks']):
            if index != click['tileNum'] - 1:
                click_order = False
        
        if click_num and click_order:
            new_data = Tiles(visitor=session['visitor'], typ=session['type'], mouse_data=mouse_data)
            db.session.add(new_data)
            db.session.commit()

            return '/tiles/success'
        else:
            return '/tiles/fail'

    elif 'visitor' in session:
        return render_template('tiles.html')
    else:
        return redirect('/unidentified')


@app.route('/reaction', methods=['POST', 'GET'])
def reaction():
    if request.method == 'POST':
        reaction_data = request.json

        new_data = Reaction(visitor=session['visitor'], typ=session['type'], reaction_data=reaction_data)
        db.session.add(new_data)
        db.session.commit()

        return '/finished'
    elif 'visitor' in session:
        return render_template('reaction.html')
    else:
        return redirect('/unidentified')


@app.route('/tiles/fail')
def fail():
    return render_template('fail.html')


@app.route('/tiles/success')
def success():
    return render_template('success.html')


@app.route('/unidentified')
def unidentified():
    return render_template('unidentified.html')


@app.route('/finished')
def finished():
    session.clear()
    session.permanent = True
    session['finished'] = True
    return render_template('finished.html')


@app.route('/completed', methods=['POST', 'GET'])
def completed():
    if request.method == 'POST':
        session.clear()
        return redirect('/')
    else:
        return render_template('completed.html')


@app.route('/mobile')
def mobile():
    return render_template('mobile.html')


@app.route('/download1')
def download1():
    records = Tiles.query.order_by(Tiles.id).all()
    mouse_list = [[getattr(curr, column.name) for column in Tiles.__mapper__.columns] for curr in records]
    mouse_csv = StringIO()
    writer = csv.writer(mouse_csv, delimiter=';')
    writer.writerows(mouse_list)

    mouse_bytes = BytesIO()
    csv_string = mouse_csv.getvalue()
    mouse_csv.close()
    mouse_bytes.write(csv_string.encode())
    mouse_bytes.seek(0)
    
    return send_file(mouse_bytes, as_attachment=True, attachment_filename='tiles.csv', mimetype='text/csv')


@app.route('/download2')
def download2():
    records = Reaction.query.order_by(Reaction.id).all()
    reaction_list = [[getattr(curr, column.name) for column in Reaction.__mapper__.columns] for curr in records]
    reaction_csv = StringIO()
    writer = csv.writer(reaction_csv, delimiter=';')
    writer.writerows(reaction_list)

    reaction_bytes = BytesIO()
    csv_string = reaction_csv.getvalue()
    reaction_csv.close()
    reaction_bytes.write(csv_string.encode())
    reaction_bytes.seek(0)
    
    return send_file(reaction_bytes, as_attachment=True, attachment_filename='reaction.csv', mimetype='text/csv')


if __name__ == '__main__':
    app.run()