wsgi_app = "src.app:app"

bind = '0.0.0.0:8000'
workers = 4
reload = True

preload_app = True
