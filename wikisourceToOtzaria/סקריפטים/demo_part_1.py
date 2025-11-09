import csv
from pathlib import Path

from mediawikitootzaria import mediawikiapi
from mediawikitootzaria.utils import sanitize_filename

mediawikiapi.BASE_URL = mediawikiapi.JEWISHBOOKS


def write_order_to_csv(csv_file_path: Path, books_list: list[list[str]]) -> None:
    with csv_file_path.open("w", newline="", encoding="windows-1255") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerows(books_list)


def get_list(book_name: str, main_url: str) -> list[list[str]]:
    list_all = []
    all_pages = mediawikiapi.get_list_by_name(book_name)
    for page in all_pages:
        page_split = page.split("/")
        list_all.append([page, f"{main_url}{page}", *page_split])
    return list_all


books_file = Path("books_ansi.csv")
target_dir = Path("books")
target_dir.mkdir(exist_ok=True, parents=True)
main_url = "https://wiki.jewishbooks.org.il/mediawiki/wiki/"
with books_file.open(encoding="windows-1255") as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        book_name, book_author, book_link, book_page_name = row
        book_pages = get_list(book_page_name, main_url)
        book_file_path = target_dir / f"{book_name}.csv"
        write_order_to_csv(book_file_path, book_pages)


# file_path = "ספר השרשים.csv"
# book_name = 'ספר השרשים (רד"ק)/'
# books_list = get_list(book_name)
# write_order_to_csv(file_path, books_list)
