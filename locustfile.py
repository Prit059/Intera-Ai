from locust import HttpUser, task, between
import random
from datetime import datetime

class AptitudeTestUser(HttpUser):
    wait_time = between(2, 5)
    
    def on_start(self):
        """Login with real user credentials"""
        self.user_data = {
            "email": "test1@example.com",  # USE REAL EMAIL
            "password": "test123"          # USE REAL PASSWORD
        }
        self.attempt_id = None
        self.aptitude_id = "6997689c82f972f2547cdcea"  # YOUR APTITUDE ID
        self.token = None
        self.headers = {}
        self.has_active_attempt = False
        
        # Login
        with self.client.post("/api/auth/login", 
                            json=self.user_data,
                            catch_response=True) as response:
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token') or data.get('data', {}).get('token')
                
                if self.token:
                    self.headers = {'Authorization': f'Bearer {self.token}'}
                    print(f"\n✅ Login successful!")
                    response.success()
                else:
                    print(f"❌ No token")
                    response.failure("No token")
            else:
                print(f"❌ Login failed: {response.status_code}")
                response.failure("Login failed")
    
    @task(3)
    def start_or_resume_attempt(self):
        """Try to start attempt - will return existing if any"""
        if not self.token:
            return
        
        with self.client.post("/api/AdAptitude/attempt/start",
                            json={
                                "quizId": self.aptitude_id,
                                "deviceInfo": {
                                    "userAgent": "Locust Test",
                                    "platform": "test"
                                }
                            },
                            headers=self.headers,
                            catch_response=True) as response:
            
            if response.status_code == 201:
                # New attempt created
                data = response.json()
                self.attempt_id = data.get('data', {}).get('_id')
                self.has_active_attempt = True
                print(f"✅ Created new attempt: {self.attempt_id}")
                response.success()
                
            elif response.status_code == 400:
                # Existing attempt found
                data = response.json()
                if data.get('data', {}).get('existingAttempt'):
                    self.attempt_id = data['data']['attemptId']
                    self.has_active_attempt = True
                    print(f"⚠️ Using existing attempt: {self.attempt_id}")
                    
                    # Resume it
                    self.resume_attempt()
                response.success()  # Don't mark as failure
            else:
                print(f"❌ Start failed: {response.status_code}")
                response.failure(f"Failed: {response.status_code}")
    
    def resume_attempt(self):
        """Resume existing attempt"""
        if not self.attempt_id:
            return
            
        with self.client.post("/api/AdAptitude/attempt/resume",
                            json={
                                "attemptId": self.attempt_id,
                                "deviceInfo": {
                                    "userAgent": "Locust Test - New Device",
                                    "platform": "test"
                                }
                            },
                            headers=self.headers,
                            catch_response=True) as response:
            
            if response.status_code == 200:
                print(f"✅ Resumed attempt: {self.attempt_id}")
                response.success()
            else:
                print(f"❌ Resume failed: {response.status_code}")
    
    @task(2)
    def get_user_attempts(self):
        """Test user attempts endpoint"""
        if not self.token:
            return
            
        with self.client.get("/api/AdAptitude/attempts/user",
                           headers=self.headers,
                           catch_response=True) as response:
            if response.status_code == 200:
                print("✅ Got user attempts")
                response.success()
            else:
                print(f"❌ Failed: {response.status_code}")
    
    @task(1)
    def check_active_attempt(self):
        """Check for active attempt"""
        if not self.token:
            return
            
        with self.client.get(f"/api/AdAptitude/attempt/active/{self.aptitude_id}",
                           headers=self.headers,
                           catch_response=True) as response:
            if response.status_code == 200:
                print("✅ Found active attempt")
                response.success()
            elif response.status_code == 404:
                print("ℹ️ No active attempt")
                response.success()
            else:
                print(f"❌ Check failed: {response.status_code}")