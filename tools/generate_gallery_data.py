import os
import json

def generate_gallery_data():
    projects_dir = "images/projects"
    output_file = "gallery_data.js"

    projects = []

    if not os.path.exists(projects_dir):
        print(f"Directory {projects_dir} not found.")
        return

    # List directories in projects_dir
    project_folders = [f for f in os.listdir(projects_dir) if os.path.isdir(os.path.join(projects_dir, f))]
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
        if os.path.exists(after_path):
            images = [f for f in os.listdir(after_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
            images.sort()
            project_data["afterImages"] = [os.path.join(after_path, img) for img in images]

        # Get Before Images
        if os.path.exists(before_path):
            images = [f for f in os.listdir(before_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
            images.sort()
            project_data["beforeImages"] = [os.path.join(before_path, img) for img in images]
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
