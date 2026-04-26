from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def home():
    return '<h1>Bine ai venit la proiectul tău AI!</h1>'

if __name__ == '__main__':
    app.run(debug=True)
