#from settings import PROJECT_ROOT, SITE_ROOT
#import os

print("IMPORTING LOCAL SETTINGS")

DEBUG = True
#TEMPLATE_DEBUG = True

DATABASES = {
    'default': {
        #'ENGINE': 'django.db.backends.sqlite3',
        #'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PW'),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}