import sys
import subprocess
import os
from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtCore import QUrl

class BrowserWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        # Set up the main window
        self.setWindowTitle("RBCAD Website Viewer")
        self.setGeometry(100, 100, 1024, 768)

        # Create a central widget and layout
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.layout = QVBoxLayout(self.central_widget)

        # Add a QWebEngineView to display the website
        self.browser = QWebEngineView()
        self.layout.addWidget(self.browser)

        # Load the RBCAD website directly
        self.browser.setUrl(QUrl("https://rbcad.netlify.app/"))

def launch_webengine_process():
    # Adjust the path to your specific location of QtWebEngineProcess.exe
    webengine_process_path = r'C:\Users\User\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\LocalCache\local-packages\Python311\site-packages\PyQt5\Qt5\bin\QtWebEngineProcess.exe'

    if os.path.exists(webengine_process_path):
        subprocess.Popen([webengine_process_path])  # Launch QtWebEngineProcess.exe
    else:
        print("QtWebEngineProcess.exe not found!")

if __name__ == '__main__':
    # Launch the QtWebEngineProcess manually
    launch_webengine_process()

    # Start the PyQt5 application
    app = QApplication(sys.argv)
    window = BrowserWindow()
    window.show()
    sys.exit(app.exec_())
