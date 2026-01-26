# Gallery Management Guide

This website uses a folder-based system to manage the gallery projects. This allows you to easily add new projects by creating folders and dragging in images.

## Project Structure

The gallery images are stored in `images/projects/`. Each folder inside this directory represents a project.

Inside each project folder, you should have:

*   **`after/`**: Contains the finished project photos. The first image in this folder is used as the cover.
*   **`before/`** (Optional): Contains "Before" photos. If present, the first image here will be shown when hovering over the project card.

### Example Structure:

```
images/
└── projects/
    ├── general_work/       <-- A catch-all project
    │   └── after/
    │       ├── img1.jpg
    │       └── img2.jpg
    └── kitchen_renovation/ <-- A specific project
        ├── after/
        │   └── final.jpg
        └── before/
            └── start.jpg
```

## How to Add a New Project

1.  **Create a Folder**: Navigate to `images/projects/` and create a new folder with your project name (e.g., `new_extension`).
2.  **Add Images**:
    *   Create an `after` folder inside it and add your finished photos.
    *   (Optional) Create a `before` folder and add the "before" photos.
3.  **Update the Website**:
    *   You need to run the gallery generator script to update the data file `gallery_data.js`.
    *   Run the following command in the project root:
        ```bash
        python tools/generate_gallery_data.py
        ```
    *   This will scan the folders and update the gallery automatically.

## Requirements

*   **Python**: You need Python installed to run the generator script.
