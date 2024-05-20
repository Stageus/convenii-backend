import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: '토큰',
    default:
      'Barear eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHgiOjQ4LCJwYXNzd29yZCI6IiQyYiQxMCRoREtJYm4vLnFya0p0QUlDTzFHbUUuc0hIejJyNEdPU0d4RS96c3kyMUdQYzVGczhHOVVBTyIsImRlbGV0ZWRfYXQiOm51bGwsImNyZWF0ZWRfYXQiOiIyMDI0LTA1LTE2VDA1OjUyOjMzLjQzNloiLCJlbWFpbCI6Imp1bmVoMjYzM0BnbWFpbC5jb20iLCJuaWNrbmFtZSI6ImFkbWluIiwicmFua19pZHgiOjIsImlhdCI6MTcxNjA2NjUyNH0.AwZ5YxtAfSghgTrLg3KiPRMuqm1rhrpGsqmFkjRD9LI',
  })
  accessToken: string;
}
