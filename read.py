import fitz
import string
import json
import os
from glob import glob
from ntpath import basename

# pdf_files 폴더 내 모든 PDF 파일을 찾는 함수
def pdfs(path):
    return glob(path)

# 파일 이름에서 확장자 제외한 이름만 반환
def file_name(path):
    return basename(path).split('.')[0]

# 모든 페이지의 텍스트를 하나로 합침
def allpages(document):
    return "".join([page.get_text() for page in document])

# 원하지 않는 기호를 제거하는 함수들
def remove_circles(text):
    circles = ["( ① )", "( ② )", "( ③ )", "( ④ )", "( ⑤ )", "①", "②", "③", "④", "⑤"]
    for circle in circles:
        text = text.replace(circle, "")
    return text

def remove_views(text):
    circle1_loc = text.find("①")
    return text[:circle1_loc] if circle1_loc != -1 else text

def remove_alphabets(text):
    alphabets = ["(A)", "(B)", "(C)", "(D)", "(a)", "(b)", "(c)", "(d)", "(e)"]
    for alphabet in alphabets:
        text = text.replace(alphabet, "")
    return text

def remove_non_ascii(text):
    ascii_chars = set(string.printable)
    return ''.join(filter(lambda x: x in ascii_chars, text))

# 문제 번호별 텍스트 추출 함수
def problem(document, num):
    num_dot_str = f"\n{num}." if num <= 40 else f"[{num}]"
    num_dot_loc = document.find(num_dot_str) + len(num_dot_str)
    x_num_dot = document[num_dot_loc:]

    x_q = None
    if x_num_dot.find("?") > 100 and num <= 40:
        x_q = x_num_dot
    else:
        q_str = "?" if num <= 40 else "."
        q_loc = x_num_dot.find(q_str) + len(q_str)
        x_q = x_num_dot[q_loc:]

    next_num_str = f"\n{num + 1}." if num <= 40 else f"\n{num}."
    next_num_loc = x_q.find(next_num_str)

    copyright_str = "\n이 문제지"
    copyright_loc = x_q.find(copyright_str)

    square_bracket_str = "\n["
    square_bracket_loc = x_q.find(square_bracket_str)
    square_bracket_loc = square_bracket_loc if square_bracket_loc != -1 else float('inf')

    full_print = x_q[:min([next_num_loc, copyright_loc, square_bracket_loc])]

    asterisk_loc = full_print.find("\n*")
    no_comment = full_print if asterisk_loc == -1 else full_print[:asterisk_loc]

    if any([x in no_comment for x in ["\n①", "\n②", "\n③", "\n④", "\n⑤"]]):
        x_circles = remove_views(no_comment)
    else:
        x_circles = remove_circles(no_comment)

    x_alphabets = remove_alphabets(x_circles)
    x_slashs = x_alphabets.replace("/", "")
    x_3points = x_slashs.replace("[3점]", "")

    x_quotes = x_3points.replace("“", "\"").replace("”", "\"").replace("’", "'").replace("‘", "'")

    x_dash = x_quotes.replace("―", "")
    x_enter = x_dash.replace("\n", " ")
    x_multispace = x_enter.replace("  ", " ")

    x_non_ascii = remove_non_ascii(x_multispace)

    return x_non_ascii[1:-1]

# main 함수에서 PDF 파일을 읽고 처리
def main():
    # pdf_files 폴더 내 모든 PDF 파일을 찾기 위해 glob 사용
    exams = pdfs("./pdf_files/*.pdf")

    # 모든 문제 데이터를 저장할 리스트
    all_problem_data = []

    for exam in exams:
        exam_name = file_name(exam)
        
        original_doc = fitz.open(exam)
        document = allpages(original_doc)

        # 각 PDF 파일에서 문제 번호 범위 지정
        for num in set(range(18, 46)) - {42, 44, 45}:
            prob = problem(document, num).replace("\"", "\\\"")

            if len(prob) < 200:
                continue

            print(f"<<<<<{exam_name} / {num}>>>>>")
            print(prob)
            print("-" * 50)

            # 문제 번호와 내용을 추가
            all_problem_data.append({
                "num": num,
                "content": prob
            })

    # 모든 문제 데이터를 2025.json 파일에 저장
    with open("./texts/2025.json", "w", encoding="utf-8") as json_file:
        json.dump(all_problem_data, json_file, ensure_ascii=False, indent=4)

main()
