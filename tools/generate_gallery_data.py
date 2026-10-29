import os
import json

DEFAULT_PROJECTS_DIR = "images/projects"
DEFAULT_OUTPUT_FILE = "gallery_data.js"

def get_sorted_images(folder_path):
    if not os.path.exists(folder_path):
        return []
    valid_exts = ('.jpg', '.jpeg', '.png', '.webp')
    with os.scandir(folder_path) as entries:
        images = [e.name for e in entries if e.is_file() and e.name.lower().endswith(valid_exts)]
    images.sort()
    return [os.path.join(folder_path, img) for img in images]

def generate_gallery_data(projects_dir=DEFAULT_PROJECTS_DIR, output_file=DEFAULT_OUTPUT_FILE):
    projects = []

    if not os.path.exists(projects_dir):
        print(f"Directory {projects_dir} not found.")
        return

    # List directories in projects_dir
    with os.scandir(projects_dir) as entries:
        project_folders = [e.name for e in entries if e.is_dir()]
    project_folders.sort()

    for folder in project_folders:
        project_path = os.path.join(projects_dir, folder)
        after_path = os.path.join(project_path, "after")
        before_path = os.path.join(project_path, "before")

        project_data = {
            "id": folder,
            "title": folder.replace("_", " ").title(),
            "afterImages": [],
            "beforeImages": [],
            "hasBefore": False
        }

        # Get After Images
        project_data["afterImages"] = get_sorted_images(after_path)

        # Get Before Images
        project_data["beforeImages"] = get_sorted_images(before_path)
        if project_data["beforeImages"]:
            project_data["hasBefore"] = True

        # Only add if there are after images
        if project_data["afterImages"]:
            projects.append(project_data)

    # Sort projects: Put "General Work" last, others alphabetical
    projects.sort(key=lambda x: (x['id'] == 'general_work', x['id']))

    js_content = f"const galleryData = {json.dumps(projects, indent=4)};"

    with open(output_file, "w") as f:
        f.write(js_content)

    print(f"Generated {output_file} with {len(projects)} projects.")

if __name__ == "__main__":
    generate_gallery_data()
