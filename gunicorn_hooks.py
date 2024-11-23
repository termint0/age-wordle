wsgi_app = "src.app:app"

bind = '0.0.0.0:8000'
workers = 4

preload_app = True
