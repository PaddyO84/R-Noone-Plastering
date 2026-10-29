import os
import sys
import tempfile
import unittest

from tools.generate_gallery_data import generate_gallery_data, get_sorted_images


class TestGenerateGalleryData(unittest.TestCase):
    def test_nonexistent_directory(self):
        # Should return without raising an error
        result = generate_gallery_data(projects_dir="/non/existent/path", output_file="dummy.js")
        self.assertIsNone(result)

    def test_get_sorted_images_nonexistent_folder(self):
        images = get_sorted_images("/non/existent/folder")
        self.assertEqual(images, [])

    def test_get_sorted_images_filters_and_sorts(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create files with various extensions and case
            files = ["img_b.jpg", "img_a.PNG", "notes.txt", "img_c.webp", "ignore.pdf"]
            for f in files:
                open(os.path.join(temp_dir, f), "w").close()

            sorted_images = get_sorted_images(temp_dir)
            expected = [
                os.path.join(temp_dir, "img_a.PNG"),
                os.path.join(temp_dir, "img_b.jpg"),
                os.path.join(temp_dir, "img_c.webp")
            ]
            self.assertEqual(sorted_images, expected)

    def test_generate_gallery_data_end_to_end(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            projects_dir = os.path.join(temp_dir, "projects")
            output_file = os.path.join(temp_dir, "output.js")
            os.makedirs(projects_dir)

            # Project 1: living_room with after & before images
            lr_after = os.path.join(projects_dir, "living_room", "after")
            lr_before = os.path.join(projects_dir, "living_room", "before")
            os.makedirs(lr_after)
            os.makedirs(lr_before)
            open(os.path.join(lr_after, "after1.jpg"), "w").close()
            open(os.path.join(lr_before, "before1.jpg"), "w").close()

            # Project 2: general_work with after only (should be sorted last)
            gw_after = os.path.join(projects_dir, "general_work", "after")
            os.makedirs(gw_after)
            open(os.path.join(gw_after, "gw1.jpg"), "w").close()

            # Project 3: attic_renovation with after only
            attic_after = os.path.join(projects_dir, "attic_renovation", "after")
            os.makedirs(attic_after)
            open(os.path.join(attic_after, "attic1.jpg"), "w").close()

            generate_gallery_data(projects_dir=projects_dir, output_file=output_file)

            self.assertTrue(os.path.exists(output_file))
            with open(output_file, "r") as f:
                content = f.read()

            self.assertTrue(content.startswith("const galleryData = ["))
            self.assertTrue(content.endswith("];"))

            # Check sorting: attic_renovation -> living_room -> general_work
            attic_idx = content.find('"id": "attic_renovation"')
            lr_idx = content.find('"id": "living_room"')
            gw_idx = content.find('"id": "general_work"')

            self.assertTrue(attic_idx != -1 and lr_idx != -1 and gw_idx != -1)
            self.assertTrue(attic_idx < lr_idx < gw_idx)

            # Check hasBefore boolean flag
            self.assertIn('"hasBefore": true', content)
            self.assertIn('"hasBefore": false', content)


if __name__ == "__main__":
    unittest.main()
