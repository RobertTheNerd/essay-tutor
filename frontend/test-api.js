// Simple test to verify our API is working
const testAPI = async () => {
  try {
    console.log('Testing Essay Tutor API...')
    
    // Test hello endpoint
    const response = await fetch('http://localhost:3000/api/hello?name=TestUser')
    const data = await response.json()
    
    console.log('✅ Hello API Response:', data)
    
    // Test upload endpoint  
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const uploadData = await uploadResponse.json()
    
    console.log('✅ Upload API Response:', uploadData)
    console.log('🎉 Backend is working!')
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message)
  }
}

testAPI()