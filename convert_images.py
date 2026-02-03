from PIL import Image
from pillow_heif import register_heif_opener
import os

# HEIF 지원 활성화
register_heif_opener()

# 변환할 파일 목록
files_to_convert = ['3.jpg']

for filename in files_to_convert:
    input_path = f'public/pic/{filename}'
    backup_path = f'public/pic/{filename}.heif.bak'

    try:
        # 백업 생성 (이미 존재하면 건너뛰기)
        if os.path.exists(input_path) and not os.path.exists(backup_path):
            os.rename(input_path, backup_path)
            print(f'백업 생성: {backup_path}')

        # 백업 파일이 있는지 확인
        if not os.path.exists(backup_path):
            print(f'[SKIP] {filename} - 변환할 파일 없음')
            continue

        # HEIF 파일 열기 및 JPEG로 변환
        img = Image.open(backup_path)

        # RGB 모드로 변환 (JPEG는 RGBA를 지원하지 않음)
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')

        # JPEG로 저장 (품질 95)
        img.save(input_path, 'JPEG', quality=95, optimize=True)
        print(f'[OK] 변환 완료: {filename} (HEIF -> JPEG)')

    except Exception as e:
        print(f'[ERROR] 변환 실패: {filename} - {e}')
        # 실패 시 백업 복원
        if os.path.exists(backup_path):
            os.rename(backup_path, input_path)

print('\n변환 작업 완료!')
