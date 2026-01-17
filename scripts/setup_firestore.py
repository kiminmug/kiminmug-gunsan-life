#!/usr/bin/env python3
"""
Firestore 샘플 데이터 생성 스크립트
군산 Life 앱을 위한 초기 데이터 설정
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import random

# Firebase Admin SDK 초기화
# 참고: Firebase Admin SDK JSON 파일이 필요합니다
# Firebase Console > 프로젝트 설정 > 서비스 계정 > Python > 새 비공개 키 생성

def initialize_firebase():
    """Firebase 초기화"""
    try:
        # 이미 초기화되어 있으면 기존 앱 사용
        return firebase_admin.get_app()
    except ValueError:
        # 초기화되지 않았으면 새로 초기화
        # 실제 사용시 서비스 계정 키 파일 경로 지정 필요
        cred_path = '/opt/flutter/firebase-admin-sdk.json'
        try:
            cred = credentials.Certificate(cred_path)
            return firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"⚠️ Firebase Admin SDK 파일이 필요합니다: {e}")
            print("Firebase Console에서 서비스 계정 키를 다운로드하세요.")
            return None

def create_sample_events(db):
    """샘플 이벤트 데이터 생성"""
    events_ref = db.collection('events')
    
    events = [
        {
            'title': '군산 벚꽃 축제 2026',
            'date_range': '4.5(토) ~ 4.13(일)',
            'location': '은파호수공원',
            'type': 'Festival',
            'description': '봄을 맞아 은파호수공원에서 열리는 벚꽃 축제. 야간 조명과 함께 다양한 공연 프로그램 진행',
            'contact': '군산시청 문화관광과 063-454-3303',
            'created_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'title': '군산시립예술단 정기연주회',
            'date_range': '3.15(토)',
            'location': '예술의전당 대공연장',
            'type': 'Culture',
            'description': '군산시립예술단의 2026년 첫 정기연주회. 클래식과 국악의 만남',
            'contact': '예술의전당 063-454-5800',
            'created_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'title': '새만금 국제마라톤',
            'date_range': '5.3(일)',
            'location': '새만금 방조제',
            'type': 'Festival',
            'description': '세계 최장 방조제를 달리는 국제 마라톤 대회',
            'contact': '새만금개발청 063-733-1000',
            'created_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'title': '군산 짬뽕 축제',
            'date_range': '10.10(금) ~ 10.12(일)',
            'location': '월명동 짬뽕거리',
            'type': 'Festival',
            'description': '군산 대표 음식 짬뽕을 즐기는 미식 축제',
            'contact': '군산시청 관광과 063-454-3337',
            'created_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'title': '근대역사박물관 특별전',
            'date_range': '2.1(토) ~ 4.30(수)',
            'location': '근대역사박물관',
            'type': 'Culture',
            'description': '군산의 근대 100년을 돌아보는 특별 기획전시',
            'contact': '근대역사박물관 063-454-7872',
            'created_at': firestore.SERVER_TIMESTAMP,
        },
    ]
    
    for event in events:
        events_ref.add(event)
        print(f"  ✓ 이벤트 추가: {event['title']}")
    
    return len(events)

def create_sample_notices(db):
    """샘플 공지사항 데이터 생성"""
    notices_ref = db.collection('notices')
    
    notices = [
        {
            'title': '앱 서비스 오픈 안내',
            'content': '군산 Life 앱이 정식 오픈되었습니다. 군산 시민 여러분의 많은 이용 부탁드립니다.',
            'type': 'info',
            'is_important': True,
            'created_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'title': '날씨 정보 업데이트 주기 변경',
            'content': '실시간 날씨 정보가 10분 단위로 업데이트됩니다.',
            'type': 'info',
            'is_important': False,
            'created_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'title': 'AI 비서 기능 추가',
            'content': 'Gemini AI 기반 군산 AI 비서 기능이 추가되었습니다. 설정에서 API 키를 입력하세요.',
            'type': 'feature',
            'is_important': True,
            'created_at': firestore.SERVER_TIMESTAMP,
        },
    ]
    
    for notice in notices:
        notices_ref.add(notice)
        print(f"  ✓ 공지 추가: {notice['title']}")
    
    return len(notices)

def create_sample_saemangeum(db):
    """새만금 프로젝트 데이터 생성"""
    projects_ref = db.collection('saemangeum_projects')
    
    projects = [
        {
            'title': '새만금 스마트 수변도시',
            'description': '첨단 기술과 친환경이 어우러진 미래형 도시 건설',
            'progress': 35,
            'status': '공사 진행 중',
            'budget': '2조 5천억원',
            'period': '2021 ~ 2030',
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'title': '새만금 국제공항',
            'description': '동북아 물류 허브를 위한 국제공항 건설 사업',
            'progress': 15,
            'status': '설계 단계',
            'budget': '1조 8천억원',
            'period': '2024 ~ 2035',
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'title': '새만금 산업단지',
            'description': '이차전지, 반도체 등 첨단산업 유치',
            'progress': 60,
            'status': '기업 입주 중',
            'budget': '5천억원',
            'period': '2020 ~ 2027',
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'title': '새만금 재생에너지 클러스터',
            'description': '태양광, 풍력 등 신재생에너지 발전단지',
            'progress': 45,
            'status': '시설 설치 중',
            'budget': '3천억원',
            'period': '2022 ~ 2028',
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
    ]
    
    for project in projects:
        projects_ref.add(project)
        print(f"  ✓ 프로젝트 추가: {project['title']}")
    
    return len(projects)

def main():
    print("=" * 50)
    print("🔥 군산 Life Firestore 데이터 설정")
    print("=" * 50)
    
    app = initialize_firebase()
    if app is None:
        print("\n❌ Firebase 초기화 실패")
        print("\n📋 수동 설정 방법:")
        print("1. Firebase Console > 프로젝트 설정 > 서비스 계정")
        print("2. 'Python' 선택 후 '새 비공개 키 생성' 클릭")
        print("3. 다운로드한 JSON 파일을 /opt/flutter/firebase-admin-sdk.json에 배치")
        print("4. 이 스크립트 다시 실행")
        return
    
    db = firestore.client()
    
    print("\n📂 이벤트 데이터 생성...")
    event_count = create_sample_events(db)
    
    print("\n📂 공지사항 데이터 생성...")
    notice_count = create_sample_notices(db)
    
    print("\n📂 새만금 프로젝트 데이터 생성...")
    project_count = create_sample_saemangeum(db)
    
    print("\n" + "=" * 50)
    print("✅ Firestore 데이터 설정 완료!")
    print(f"   - 이벤트: {event_count}개")
    print(f"   - 공지사항: {notice_count}개")
    print(f"   - 새만금 프로젝트: {project_count}개")
    print("=" * 50)

if __name__ == "__main__":
    main()
